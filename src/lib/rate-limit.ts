import 'server-only';

import { and, eq, lt, sql } from 'drizzle-orm';

import { db } from '@db/client';
import { rateLimits } from '@db/schema/identity';

import { sha256 } from './crypto';

export type RateLimitRule = {
  name: string;
  limit: number;
  windowMs: number;
};

export const RATE_LIMITS = {
  otpSend: { name: 'otp:send', limit: 5, windowMs: 15 * 60_000 },
  otpVerify: { name: 'otp:verify', limit: 10, windowMs: 15 * 60_000 },
  sessionCreate: { name: 'auth:session', limit: 20, windowMs: 15 * 60_000 },
  checkout: { name: 'checkout', limit: 15, windowMs: 10 * 60_000 },
  orderCreate: { name: 'order:create', limit: 10, windowMs: 10 * 60_000 },
  couponApply: { name: 'coupon:apply', limit: 20, windowMs: 10 * 60_000 },
  search: { name: 'search', limit: 60, windowMs: 60_000 },
  adminMutation: { name: 'admin:mutation', limit: 120, windowMs: 60_000 },
  webhook: { name: 'webhook', limit: 300, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function consumeRateLimit(
  rule: RateLimitRule,
  subject: string,
  now = Date.now(),
): Promise<RateLimitResult> {
  const windowStart = Math.floor(now / rule.windowMs) * rule.windowMs;
  const bucketKey = `${rule.name}:${sha256(subject).slice(0, 32)}`;
  const expiresAt = new Date(windowStart + rule.windowMs * 2);

  // Transaction serialises concurrent increments so each caller observes its own post-increment count.
  const hits = await db.transaction(async (tx) => {
    await tx
      .insert(rateLimits)
      .values({ bucketKey, windowStart, hits: 1, expiresAt })
      .onDuplicateKeyUpdate({ set: { hits: sql`${rateLimits.hits} + 1` } });

    const [row] = await tx
      .select({ hits: rateLimits.hits })
      .from(rateLimits)
      .where(and(eq(rateLimits.bucketKey, bucketKey), eq(rateLimits.windowStart, windowStart)))
      .limit(1);

    return row?.hits ?? 1;
  });

  const ok = hits <= rule.limit;

  return {
    ok,
    remaining: Math.max(0, rule.limit - hits),
    retryAfterSeconds: ok ? 0 : Math.ceil((windowStart + rule.windowMs - now) / 1000),
  };
}

export async function pruneRateLimits(now = new Date()): Promise<void> {
  await db.delete(rateLimits).where(lt(rateLimits.expiresAt, now));
}
