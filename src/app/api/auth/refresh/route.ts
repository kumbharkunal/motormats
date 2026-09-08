import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@db/client';
import { users } from '@db/schema/identity';
import { clientAddress } from '@/lib/api/action';
import { AppError } from '@/lib/api/errors';
import { fail, newRequestId, ok } from '@/lib/api/response';
import { recordAudit } from '@/lib/audit';
import {
  clearSessionCookies,
  readSessionCookies,
  rotateRefreshToken,
  setSessionCookies,
  signAccessToken,
} from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  try {
    const { refreshToken } = await readSessionCookies();
    if (!refreshToken) throw new AppError('SESSION_EXPIRED');

    const address = await clientAddress();
    const rotation = await rotateRefreshToken(refreshToken, {
      userAgent: request.headers.get('user-agent'),
      ip: address,
    });

    if (rotation.status === 'reused') {
      await clearSessionCookies();
      await recordAudit({
        actorUserId: null,
        action: 'auth.refresh_reuse_detected',
        resourceType: 'session',
        metadata: { outcome: 'family_revoked' },
      });
      throw new AppError('SESSION_EXPIRED');
    }

    if (rotation.status === 'invalid') {
      await clearSessionCookies();
      throw new AppError('SESSION_EXPIRED');
    }

    const [user] = await db
      .select({
        id: users.id,
        publicId: users.publicId,
        role: users.role,
        status: users.status,
        sessionEpoch: users.sessionEpoch,
      })
      .from(users)
      .where(eq(users.id, rotation.userId))
      .limit(1);

    if (!user || user.status !== 'active') {
      await clearSessionCookies();
      throw new AppError('SESSION_EXPIRED');
    }

    const accessToken = await signAccessToken({
      sub: String(user.id),
      pid: user.publicId,
      role: user.role,
      epoch: user.sessionEpoch,
    });

    const csrfToken = await setSessionCookies(accessToken, rotation.refreshToken);
    return ok({ publicId: user.publicId, role: user.role, csrfToken }, requestId);
  } catch (error) {
    return fail(error, requestId);
  }
}
