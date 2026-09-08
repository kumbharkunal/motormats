import { and, eq, isNull } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db, pool } from '@db/client';
import { sessions, users } from '@db/schema/identity';
import { sha256 } from '@/lib/crypto';
import { newPublicId } from '@/lib/ids';
import {
  issueRefreshToken,
  revokeAllUserSessions,
  rotateRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from '@/lib/auth/session';

/**
 * Session handling against a real database. Rotation, reuse detection and
 * global revocation are the mechanisms that contain a stolen token, so they are
 * tested against the real store rather than a stub.
 */

let userId: number;

beforeAll(async () => {
  const publicId = newPublicId();
  const [inserted] = await db.insert(users).values({
    publicId,
    firebaseUid: `test-${publicId}`,
    role: 'customer',
    status: 'active',
  });
  userId = inserted.insertId;
});

afterAll(async () => {
  await db.delete(users).where(eq(users.id, userId));
  await pool.end();
});

describe('access tokens', () => {
  it('round-trips its claims', async () => {
    const token = await signAccessToken({ sub: '42', pid: 'PID', role: 'admin', epoch: 3 });
    const claims = await verifyAccessToken(token);

    expect(claims).toEqual({ sub: '42', pid: 'PID', role: 'admin', epoch: 3 });
  });

  it('rejects a tampered payload', async () => {
    const token = await signAccessToken({ sub: '1', pid: 'PID', role: 'customer', epoch: 0 });
    const [header, payload, signature] = token.split('.');

    // Re-encode the payload claiming super_admin, keeping the original signature.
    const decoded = JSON.parse(Buffer.from(payload!, 'base64url').toString());
    decoded.role = 'super_admin';
    const forgedPayload = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    expect(await verifyAccessToken(`${header}.${forgedPayload}.${signature}`)).toBeNull();
  });

  it('rejects an unsigned "alg: none" token', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ sub: '1', pid: 'P', role: 'super_admin', epoch: 0 }),
    ).toString('base64url');

    expect(await verifyAccessToken(`${header}.${payload}.`)).toBeNull();
  });

  it('rejects malformed input without throwing', async () => {
    expect(await verifyAccessToken('')).toBeNull();
    expect(await verifyAccessToken('not-a-token')).toBeNull();
  });
});

describe('refresh token rotation', () => {
  it('issues a token that is only ever stored as a digest', async () => {
    const raw = await issueRefreshToken(userId);

    const [row] = await db
      .select({ tokenHash: sessions.tokenHash })
      .from(sessions)
      .where(eq(sessions.tokenHash, sha256(raw)))
      .limit(1);

    expect(row).toBeDefined();
    // The raw token must appear nowhere in the table.
    const rawMatches = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.tokenHash, raw));
    expect(rawMatches).toHaveLength(0);
  });

  it('exchanges an active token for a new one and retires the old', async () => {
    const first = await issueRefreshToken(userId);
    const rotation = await rotateRefreshToken(first);

    expect(rotation.status).toBe('ok');
    if (rotation.status !== 'ok') return;
    expect(rotation.refreshToken).not.toBe(first);
    expect(rotation.userId).toBe(userId);

    // The old token is now revoked.
    const [old] = await db
      .select({ revokedAt: sessions.revokedAt })
      .from(sessions)
      .where(eq(sessions.tokenHash, sha256(first)))
      .limit(1);
    expect(old?.revokedAt).not.toBeNull();
  });

  it('treats replay of a retired token as theft and revokes the whole family', async () => {
    const first = await issueRefreshToken(userId);
    const second = await rotateRefreshToken(first);
    expect(second.status).toBe('ok');
    if (second.status !== 'ok') return;

    // An attacker replays the token that was already exchanged.
    const replay = await rotateRefreshToken(first);
    expect(replay.status).toBe('reused');

    // The legitimate holder's current token must also be dead now.
    const afterBreach = await rotateRefreshToken(second.refreshToken);
    expect(afterBreach.status).toBe('reused');
  });

  it('rejects an unknown token', async () => {
    expect((await rotateRefreshToken('never-issued')).status).toBe('invalid');
  });

  it('rejects an expired token', async () => {
    const raw = await issueRefreshToken(userId);
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(sessions.tokenHash, sha256(raw)));

    expect((await rotateRefreshToken(raw)).status).toBe('invalid');
  });
});

describe('global revocation', () => {
  it('kills every live session and invalidates outstanding access tokens', async () => {
    const tokenA = await issueRefreshToken(userId);
    const tokenB = await issueRefreshToken(userId);

    const [before] = await db
      .select({ epoch: users.sessionEpoch })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    await revokeAllUserSessions(userId);

    const live = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
    expect(live).toHaveLength(0);

    expect((await rotateRefreshToken(tokenA)).status).toBe('reused');
    expect((await rotateRefreshToken(tokenB)).status).toBe('reused');

    // The epoch bump is what kills already-issued access tokens immediately,
    // rather than leaving them valid until they expire.
    const [after] = await db
      .select({ epoch: users.sessionEpoch })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    expect(after!.epoch).toBe(before!.epoch + 1);
  });
});
