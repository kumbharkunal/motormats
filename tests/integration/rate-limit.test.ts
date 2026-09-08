import { afterAll, describe, expect, it } from 'vitest';

import { pool } from '@db/client';
import { consumeRateLimit, pruneRateLimits, type RateLimitRule } from '@/lib/rate-limit';

/**
 * Runs against a real MySQL. The point of a database-backed limiter is that its
 * counters survive a process restart, which an in-memory map cannot — so it is
 * only meaningful to test against the real store.
 */

const rule: RateLimitRule = { name: 'test:limit', limit: 3, windowMs: 60_000 };

function uniqueSubject() {
  return `subject-${Math.random().toString(36).slice(2)}`;
}

afterAll(async () => {
  await pool.end();
});

describe('consumeRateLimit', () => {
  it('allows exactly `limit` attempts, then rejects', async () => {
    const subject = uniqueSubject();

    for (let attempt = 1; attempt <= rule.limit; attempt += 1) {
      const result = await consumeRateLimit(rule, subject);
      expect(result.ok, `attempt ${attempt} should be allowed`).toBe(true);
      expect(result.remaining).toBe(rule.limit - attempt);
    }

    const blocked = await consumeRateLimit(rule, subject);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(rule.windowMs / 1000);
  });

  it('keeps separate subjects in separate buckets', async () => {
    const a = uniqueSubject();
    const b = uniqueSubject();

    for (let i = 0; i < rule.limit; i += 1) await consumeRateLimit(rule, a);
    expect((await consumeRateLimit(rule, a)).ok).toBe(false);

    // b must be untouched by a's exhaustion.
    expect((await consumeRateLimit(rule, b)).ok).toBe(true);
  });

  it('keeps separate rules in separate buckets for the same subject', async () => {
    const subject = uniqueSubject();
    const other: RateLimitRule = { name: 'test:other', limit: 3, windowMs: 60_000 };

    for (let i = 0; i < rule.limit; i += 1) await consumeRateLimit(rule, subject);
    expect((await consumeRateLimit(rule, subject)).ok).toBe(false);
    expect((await consumeRateLimit(other, subject)).ok).toBe(true);
  });

  it('resets when the window rolls over', async () => {
    const subject = uniqueSubject();
    const now = Date.now();

    for (let i = 0; i < rule.limit; i += 1) await consumeRateLimit(rule, subject, now);
    expect((await consumeRateLimit(rule, subject, now)).ok).toBe(false);

    // A timestamp in the next window lands in a different bucket.
    const next = now + rule.windowMs;
    expect((await consumeRateLimit(rule, subject, next)).ok).toBe(true);
  });

  it('counts concurrent attempts without losing any', async () => {
    const subject = uniqueSubject();
    const burst: RateLimitRule = { name: 'test:burst', limit: 5, windowMs: 60_000 };

    // Ten simultaneous requests against a limit of five: exactly five may pass.
    const results = await Promise.all(
      Array.from({ length: 10 }, () => consumeRateLimit(burst, subject)),
    );

    expect(results.filter((r) => r.ok)).toHaveLength(burst.limit);
  });

  it('prunes only windows that have already expired', async () => {
    const subject = uniqueSubject();
    const past = Date.now() - rule.windowMs * 10;

    await consumeRateLimit(rule, subject, past);
    const live = uniqueSubject();
    await consumeRateLimit(rule, live);

    await pruneRateLimits();

    // The live bucket keeps its count; the stale one is gone and starts fresh.
    expect((await consumeRateLimit(rule, live)).remaining).toBe(rule.limit - 2);
    expect((await consumeRateLimit(rule, subject, past)).remaining).toBe(rule.limit - 1);
  });
});
