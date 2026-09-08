import type { NextRequest } from 'next/server';

import { fail, newRequestId, ok } from '@/lib/api/response';
import { AppError } from '@/lib/api/errors';
import { pruneExpiredSessions } from '@/lib/auth/session';
import { safeEqual } from '@/lib/crypto';
import { serverEnv } from '@/lib/env.server';
import { pruneIdempotencyKeys } from '@/lib/idempotency';
import { logger } from '@/lib/logger';
import { pruneRateLimits } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  try {
    const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
    if (!safeEqual(provided, serverEnv.CRON_SECRET)) {
      throw new AppError('FORBIDDEN');
    }

    const [idempotencyKeysRemoved] = await Promise.all([
      pruneIdempotencyKeys(),
      pruneRateLimits(),
      pruneExpiredSessions(),
    ]);

    logger.info({ idempotencyKeysRemoved }, 'maintenance completed');
    return ok({ idempotencyKeysRemoved }, requestId);
  } catch (error) {
    return fail(error, requestId);
  }
}
