import 'server-only';

import { headers } from 'next/headers';
import type { z } from 'zod';

import { requirePermission, requireUser, type CurrentUser } from '../auth/current-user';
import type { Permission } from '../auth/rbac';
import { sha256 } from '../crypto';
import { logger } from '../logger';
import { consumeRateLimit, type RateLimitRule } from '../rate-limit';
import { AppError, isAppError } from './errors';
import { flattenZodError, newRequestId } from './response';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string[]> };

type ActionConfig<TSchema extends z.ZodType, TResult> = {
  input?: TSchema;
  auth?: boolean;
  permission?: Permission;
  rateLimit?: RateLimitRule;
  handler: (context: {
    input: z.infer<TSchema>;
    user: CurrentUser;
    requestId: string;
  }) => Promise<TResult>;
};

export function createAction<TSchema extends z.ZodType, TResult>(
  config: ActionConfig<TSchema, TResult>,
) {
  return async (rawInput?: unknown): Promise<ActionResult<TResult>> => {
    const requestId = newRequestId();
    const log = logger.child({ requestId });

    try {
      const parsed = config.input
        ? config.input.safeParse(rawInput)
        : { success: true as const, data: undefined };
      if (!parsed.success) {
        throw new AppError('VALIDATION_FAILED', { fieldErrors: flattenZodError(parsed.error) });
      }

      const needsUser = config.auth === true || config.permission !== undefined;
      const user = config.permission
        ? await requirePermission(config.permission)
        : needsUser
          ? await requireUser()
          : anonymousUser();

      if (config.rateLimit) {
        const subject = user.id > 0 ? `user:${user.id}` : `ip:${await clientAddress()}`;
        const result = await consumeRateLimit(config.rateLimit, subject);
        if (!result.ok) {
          throw new AppError('RATE_LIMITED', { detail: { rule: config.rateLimit.name } });
        }
      }

      const data = await config.handler({
        input: parsed.data as z.infer<TSchema>,
        user,
        requestId,
      });

      return { ok: true, data };
    } catch (error) {
      if (isAppError(error)) {
        if (error.status >= 500)
          log.error({ code: error.code, detail: error.detail }, 'action failed');
        else log.info({ code: error.code }, 'action rejected');

        return {
          ok: false,
          code: error.code,
          message: error.userMessage,
          ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
        };
      }

      log.error({ err: error }, 'unhandled action error');
      const internal = new AppError('INTERNAL');
      return { ok: false, code: internal.code, message: internal.userMessage };
    }
  };
}

function anonymousUser(): CurrentUser {
  return {
    id: 0,
    publicId: '',
    role: 'customer',
    status: 'active',
    name: null,
    phone: null,
    email: null,
    signInProvider: null,
  };
}

export async function clientAddress(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
  return sha256(ip);
}
