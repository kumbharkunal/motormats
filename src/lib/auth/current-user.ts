import 'server-only';

import { eq } from 'drizzle-orm';
import { cache } from 'react';

import { db } from '@db/client';
import { users, type UserRole, type UserStatus } from '@db/schema/identity';

import { AppError } from '../api/errors';
import { can, isElevatedPermission, type Permission } from './rbac';
import { readSessionCookies, verifyAccessToken } from './session';

/**
 * The admin panel is reachable only from an email/password sign-in. A session
 * minted by phone OTP or Google is refused even when the role would allow it,
 * so a compromised customer login method cannot reach the back office.
 */
export const ADMIN_PROVIDER = 'password';

export type CurrentUser = {
  id: number;
  publicId: string;
  role: UserRole;
  status: UserStatus;
  name: string | null;
  phone: string | null;
  email: string | null;
  // From the session claims, not the user row: which method opened *this* session.
  signInProvider: string | null;
};

// Row is always re-read, so role changes and revocations take effect immediately.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const { accessToken } = await readSessionCookies();
  if (!accessToken) return null;

  const claims = await verifyAccessToken(accessToken);
  if (!claims) return null;

  const userId = Number(claims.sub);
  if (!Number.isInteger(userId)) return null;

  const [row] = await db
    .select({
      id: users.id,
      publicId: users.publicId,
      role: users.role,
      status: users.status,
      name: users.name,
      phone: users.phone,
      email: users.email,
      sessionEpoch: users.sessionEpoch,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;
  // A bumped epoch means every token issued before the bump is dead.
  if (row.sessionEpoch !== claims.epoch) return null;
  if (row.status !== 'active') return null;

  return {
    id: row.id,
    publicId: row.publicId,
    role: row.role,
    status: row.status,
    name: row.name,
    phone: row.phone,
    email: row.email,
    signInProvider: claims.prv,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError('UNAUTHENTICATED');
  return user;
}

export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) {
    throw new AppError('FORBIDDEN', { detail: { permission, role: user.role } });
  }
  // Gating only the admin UI would leave Server Actions open: an admin who
  // signed in by OTP could still call a mutation directly.
  if (isElevatedPermission(permission) && user.signInProvider !== ADMIN_PROVIDER) {
    throw new AppError('FORBIDDEN', { detail: { permission, reason: 'provider' } });
  }
  return user;
}

/** The single authoritative admin check: correct role *and* correct sign-in method. */
export async function requireAdminSession(): Promise<CurrentUser> {
  return requirePermission('admin:access');
}
