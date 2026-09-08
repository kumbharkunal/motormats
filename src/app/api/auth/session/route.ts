import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { provisionUserFromFirebase } from '@/features/auth/server/user-repository';
import { clientAddress } from '@/lib/api/action';
import { AppError } from '@/lib/api/errors';
import { fail, newRequestId, ok } from '@/lib/api/response';
import { toIdentity, verifyFirebaseIdToken } from '@/lib/auth/firebase-admin';
import { issueRefreshToken, setSessionCookies, signAccessToken } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';
import { consumeRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const bodySchema = z.object({
  idToken: z.string().min(16).max(4096),
});

export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  try {
    const address = await clientAddress();
    const limit = await consumeRateLimit(RATE_LIMITS.sessionCreate, `ip:${address}`);
    if (!limit.ok) throw new AppError('RATE_LIMITED');

    const body = bodySchema.parse(await request.json());

    const decoded = await verifyFirebaseIdToken(body.idToken);
    if (!decoded) throw new AppError('UNAUTHENTICATED');

    const identity = toIdentity(decoded);
    const user = await provisionUserFromFirebase(identity);

    const accessToken = await signAccessToken({
      sub: String(user.id),
      pid: user.publicId,
      role: user.role,
      epoch: user.sessionEpoch,
    });
    const refreshToken = await issueRefreshToken(user.id, {
      userAgent: request.headers.get('user-agent'),
      ip: address,
    });

    const csrfToken = await setSessionCookies(accessToken, refreshToken);

    await recordAudit({
      actorUserId: user.id,
      action: 'auth.sign_in',
      resourceType: 'user',
      resourceId: user.publicId,
      metadata: { provider: identity.signInProvider },
    });

    return ok(
      { publicId: user.publicId, role: user.role, csrfToken },
      requestId,
    );
  } catch (error) {
    return fail(error, requestId);
  }
}
