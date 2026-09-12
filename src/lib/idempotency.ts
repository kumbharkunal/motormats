import 'server-only';

import { and, eq, lt } from 'drizzle-orm';

import { db } from '@db/client';
import { idempotencyKeys } from '@db/schema/identity';

import { AppError } from './api/errors';
import { sha256 } from './crypto';
import { affectedRows } from './db-result';
import { logger } from './logger';

const TTL_MS = 24 * 60 * 60 * 1000;

// Duplicate key = INSERT conflict, so the DB serialises concurrent attempts rather than application logic.
export async function withIdempotency<T extends Record<string, unknown>>(
  params: {
    scope: string;
    key: string;
    userId: number;
    request: unknown;
  },
  operation: () => Promise<T>,
): Promise<T> {
  const requestHash = sha256(JSON.stringify(params.request));
  const expiresAt = new Date(Date.now() + TTL_MS);

  try {
    await db.insert(idempotencyKeys).values({
      scope: params.scope,
      idempotencyKey: params.key,
      userId: params.userId,
      requestHash,
      status: 'in_progress',
      expiresAt,
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
    return replayOrConflict<T>(params.scope, params.key, requestHash);
  }

  try {
    const result = await operation();

    await db
      .update(idempotencyKeys)
      .set({ status: 'completed', responseSnapshot: result })
      .where(matchKey(params.scope, params.key));

    return result;
  } catch (error) {
    await db.delete(idempotencyKeys).where(matchKey(params.scope, params.key));
    throw error;
  }
}

async function replayOrConflict<T>(scope: string, key: string, requestHash: string): Promise<T> {
  const [existing] = await db
    .select({
      status: idempotencyKeys.status,
      requestHash: idempotencyKeys.requestHash,
      responseSnapshot: idempotencyKeys.responseSnapshot,
    })
    .from(idempotencyKeys)
    .where(matchKey(scope, key))
    .limit(1);

  if (!existing) throw new AppError('CONFLICT');

  if (existing.requestHash !== requestHash) {
    logger.warn({ scope }, 'idempotency key reused with a different payload');
    throw new AppError('CONFLICT');
  }

  if (existing.status === 'completed' && existing.responseSnapshot) {
    return existing.responseSnapshot as T;
  }

  throw new AppError('CONFLICT');
}

function isDuplicateKeyError(error: unknown): boolean {
  const codeOf = (value: unknown): unknown =>
    typeof value === 'object' && value !== null && 'code' in value
      ? (value as { code: unknown }).code
      : undefined;

  if (codeOf(error) === 'ER_DUP_ENTRY') return true;

  const cause =
    typeof error === 'object' && error !== null ? (error as { cause?: unknown }).cause : undefined;
  return codeOf(cause) === 'ER_DUP_ENTRY';
}

function matchKey(scope: string, key: string) {
  return and(eq(idempotencyKeys.scope, scope), eq(idempotencyKeys.idempotencyKey, key));
}

export async function pruneIdempotencyKeys(now = new Date()): Promise<number> {
  const result = await db.delete(idempotencyKeys).where(lt(idempotencyKeys.expiresAt, now));
  return affectedRows(result);
}
