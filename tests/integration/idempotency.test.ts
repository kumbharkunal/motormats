import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { db, pool } from '@db/client';
import { idempotencyKeys, users } from '@db/schema/identity';

import { AppError } from '@/lib/api/errors';
import { newPublicId } from '@/lib/ids';
import { pruneIdempotencyKeys, withIdempotency } from '@/lib/idempotency';

/**
 * Idempotency guards order creation, where running twice means taking stock
 * twice and potentially charging twice. Tested against the real database
 * because the guarantee comes from a unique index, not from application logic.
 */

const SCOPE = 'test:idempotency';

// The table carries a foreign key to users, so the tests need a real one.
let userId: number;

beforeAll(async () => {
  const publicId = newPublicId();
  const [row] = await db.insert(users).values({
    publicId,
    firebaseUid: `idem-test-${publicId}`,
    role: 'customer',
    status: 'active',
  });
  userId = row.insertId;
});

beforeEach(async () => {
  await db.delete(idempotencyKeys).where(eq(idempotencyKeys.scope, SCOPE));
});

afterAll(async () => {
  await db.delete(idempotencyKeys).where(eq(idempotencyKeys.scope, SCOPE));
  await db.delete(users).where(eq(users.id, userId));
  await pool.end();
});

function uniqueKey() {
  return `key-${Math.random().toString(36).slice(2)}`;
}

describe('withIdempotency', () => {
  it('runs the operation once and returns its result', async () => {
    let calls = 0;
    const result = await withIdempotency(
      { scope: SCOPE, key: uniqueKey(), userId, request: { a: 1 } },
      async () => {
        calls += 1;
        return { orderNumber: 'MM0001' };
      },
    );

    expect(calls).toBe(1);
    expect(result).toEqual({ orderNumber: 'MM0001' });
  });

  it('replays the first response instead of running again', async () => {
    const key = uniqueKey();
    let calls = 0;
    const run = () =>
      withIdempotency({ scope: SCOPE, key, userId, request: { a: 1 } }, async () => {
        calls += 1;
        return { orderNumber: `MM-${calls}` };
      });

    const first = await run();
    const second = await run();

    expect(calls).toBe(1);
    // The retry must see the original order, not a new one.
    expect(second).toEqual(first);
  });

  it('rejects the same key used for a different payload', async () => {
    const key = uniqueKey();
    await withIdempotency({ scope: SCOPE, key, userId, request: { a: 1 } }, async () => ({
      ok: true,
    }));

    await expect(
      withIdempotency({ scope: SCOPE, key, userId, request: { a: 999 } }, async () => ({
        ok: true,
      })),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('runs the operation only once across concurrent submissions', async () => {
    const key = uniqueKey();
    let calls = 0;

    // The double-click case: several identical requests land at once.
    const results = await Promise.allSettled(
      Array.from({ length: 6 }, () =>
        withIdempotency({ scope: SCOPE, key, userId, request: { a: 1 } }, async () => {
          calls += 1;
          await new Promise((resolve) => setTimeout(resolve, 40));
          return { orderNumber: 'MM-ONCE' };
        }),
      ),
    );

    expect(calls).toBe(1);
    // Losers either replay the result or are told to wait; none run the work.
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    for (const outcome of fulfilled) {
      expect(outcome.value).toEqual({ orderNumber: 'MM-ONCE' });
    }
  });

  it('releases the key when the operation fails, so a real retry can proceed', async () => {
    const key = uniqueKey();
    let calls = 0;

    await expect(
      withIdempotency({ scope: SCOPE, key, userId, request: { a: 1 } }, async () => {
        calls += 1;
        throw new AppError('INSUFFICIENT_STOCK');
      }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK' });

    // A failed attempt must not lock the customer out of trying again.
    const retry = await withIdempotency(
      { scope: SCOPE, key, userId, request: { a: 1 } },
      async () => {
        calls += 1;
        return { orderNumber: 'MM-RETRY' };
      },
    );

    expect(calls).toBe(2);
    expect(retry).toEqual({ orderNumber: 'MM-RETRY' });
  });

  it('keeps different keys independent', async () => {
    const results = await Promise.all([
      withIdempotency({ scope: SCOPE, key: uniqueKey(), userId, request: {} }, async () => ({
        n: 1,
      })),
      withIdempotency({ scope: SCOPE, key: uniqueKey(), userId, request: {} }, async () => ({
        n: 2,
      })),
    ]);

    expect(results.map((r) => r.n).sort()).toEqual([1, 2]);
  });

  it('prunes only expired keys', async () => {
    const live = uniqueKey();
    await withIdempotency({ scope: SCOPE, key: live, userId, request: {} }, async () => ({
      ok: true,
    }));

    await db.insert(idempotencyKeys).values({
      scope: SCOPE,
      idempotencyKey: uniqueKey(),
      userId: null,
      requestHash: 'a'.repeat(64),
      status: 'completed',
      expiresAt: new Date(Date.now() - 60_000),
    });

    const removed = await pruneIdempotencyKeys();
    expect(removed).toBeGreaterThanOrEqual(1);

    const remaining = await db
      .select({ key: idempotencyKeys.idempotencyKey })
      .from(idempotencyKeys)
      .where(eq(idempotencyKeys.scope, SCOPE));
    expect(remaining.map((r) => r.key)).toContain(live);
  });
});
