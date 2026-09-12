import 'server-only';

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { logger } from '../logger';
import { AppError, isAppError } from './errors';

export type ApiSuccess<T> = { ok: true; data: T; requestId: string };
export type ApiFailure = {
  ok: false;
  error: { code: string; message: string; fieldErrors?: Record<string, string[]> };
  requestId: string;
};
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function newRequestId(): string {
  return crypto.randomUUID();
}

export function ok<T>(
  data: T,
  requestId: string,
  init?: ResponseInit,
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data, requestId }, init);
}

export function fail(error: unknown, requestId: string): NextResponse<ApiFailure> {
  const log = logger.child({ requestId });

  if (error instanceof ZodError) {
    const appError = new AppError('VALIDATION_FAILED', {
      fieldErrors: flattenZodError(error),
    });
    return toResponse(appError, requestId);
  }

  if (isAppError(error)) {
    if (error.status >= 500) {
      log.error({ code: error.code, detail: error.detail }, 'request failed');
    } else {
      log.info({ code: error.code }, 'request rejected');
    }
    return toResponse(error, requestId);
  }

  log.error({ err: error }, 'unhandled error');
  return toResponse(new AppError('INTERNAL'), requestId);
}

function toResponse(error: AppError, requestId: string): NextResponse<ApiFailure> {
  return NextResponse.json(
    {
      ok: false as const,
      error: {
        code: error.code,
        message: error.userMessage,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      },
      requestId,
    },
    { status: error.status },
  );
}

export function flattenZodError(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}
