import 'server-only';

import { and, eq, isNull, lt, sql } from 'drizzle-orm';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

import { db } from '@db/client';
import { sessions, users, type UserRole } from '@db/schema/identity';

import { randomToken, sha256 } from '../crypto';
import { serverEnv } from '../env.server';
import { newPublicId } from '../ids';

// ACCESS: short-lived JWT. REFRESH: long-lived opaque token stored as SHA-256 digest, rotated on each use.
export const ACCESS_COOKIE = 'mm_session';
export const REFRESH_COOKIE = 'mm_refresh';
export const CSRF_COOKIE = 'mm_csrf';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ISSUER = 'motormats';

const secret = new TextEncoder().encode(serverEnv.SESSION_SECRET);

export type SessionClaims = {
  sub: string;
  pid: string;
  role: UserRole;
  epoch: number;
};

export async function signAccessToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({ pid: claims.pid, role: claims.role, epoch: claims.epoch })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: ISSUER,
      algorithms: ['HS256'],
    });

    if (typeof payload.sub !== 'string') return null;
    if (typeof payload.pid !== 'string') return null;
    if (typeof payload.role !== 'string') return null;
    if (typeof payload.epoch !== 'number') return null;

    return {
      sub: payload.sub,
      pid: payload.pid,
      role: payload.role as UserRole,
      epoch: payload.epoch,
    };
  } catch {
    return null;
  }
}

export async function issueRefreshToken(
  userId: number,
  context: { familyId?: string; userAgent?: string | null; ip?: string | null } = {},
): Promise<string> {
  const raw = randomToken();
  await db.insert(sessions).values({
    userId,
    tokenHash: sha256(raw),
    familyId: context.familyId ?? newPublicId(),
    userAgentHash: context.userAgent ? sha256(context.userAgent) : null,
    ipHash: context.ip ? sha256(context.ip) : null,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
  return raw;
}

type RotationResult =
  | { status: 'ok'; userId: number; refreshToken: string }
  | { status: 'invalid' }
  | { status: 'reused' };

// A revoked token that is replayed triggers family-wide revocation.
export async function rotateRefreshToken(
  rawToken: string,
  context: { userAgent?: string | null; ip?: string | null } = {},
): Promise<RotationResult> {
  const tokenHash = sha256(rawToken);

  const [existing] = await db
    .select({
      id: sessions.id,
      userId: sessions.userId,
      familyId: sessions.familyId,
      revokedAt: sessions.revokedAt,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  if (!existing) return { status: 'invalid' };

  if (existing.revokedAt !== null) {
    await revokeSessionFamily(existing.familyId);
    return { status: 'reused' };
  }

  if (existing.expiresAt.getTime() <= Date.now()) return { status: 'invalid' };

  const now = new Date();
  await db.update(sessions).set({ revokedAt: now }).where(eq(sessions.id, existing.id));

  const refreshToken = await issueRefreshToken(existing.userId, {
    familyId: existing.familyId,
    ...context,
  });

  return { status: 'ok', userId: existing.userId, refreshToken };
}

export async function revokeSessionFamily(familyId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.familyId, familyId), isNull(sessions.revokedAt)));
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.tokenHash, sha256(rawToken)), isNull(sessions.revokedAt)));
}

// Bumps session epoch so all outstanding access tokens stop verifying immediately.
export async function revokeAllUserSessions(userId: number): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));

    await tx
      .update(users)
      .set({ sessionEpoch: sql`${users.sessionEpoch} + 1` })
      .where(eq(users.id, userId));
  });
}

export async function pruneExpiredSessions(now = new Date()): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
}

export async function readSessionCookies(): Promise<{
  accessToken: string | undefined;
  refreshToken: string | undefined;
}> {
  const store = await cookies();
  return {
    accessToken: store.get(ACCESS_COOKIE)?.value,
    refreshToken: store.get(REFRESH_COOKIE)?.value,
  };
}

const COOKIE_BASE = {
  httpOnly: true,
  secure: serverEnv.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

export async function setSessionCookies(accessToken: string, refreshToken: string): Promise<string> {
  const store = await cookies();
  const csrfToken = randomToken(24);

  store.set(ACCESS_COOKIE, accessToken, { ...COOKIE_BASE, maxAge: ACCESS_TTL_SECONDS });
  store.set(REFRESH_COOKIE, refreshToken, { ...COOKIE_BASE, maxAge: REFRESH_TTL_MS / 1000 });
  // Readable by script — the double-submit CSRF check needs the client to echo it in a header.
  store.set(CSRF_COOKIE, csrfToken, {
    ...COOKIE_BASE,
    httpOnly: false,
    maxAge: REFRESH_TTL_MS / 1000,
  });

  return csrfToken;
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE]) {
    store.set(name, '', { ...COOKIE_BASE, httpOnly: name !== CSRF_COOKIE, maxAge: 0 });
  }
}
