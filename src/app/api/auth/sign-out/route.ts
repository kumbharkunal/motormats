import { fail, newRequestId, ok } from '@/lib/api/response';
import { getCurrentUser } from '@/lib/auth/current-user';
import { clearSessionCookies, readSessionCookies, revokeRefreshToken } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';

export async function POST() {
  const requestId = newRequestId();

  try {
    const user = await getCurrentUser();
    const { refreshToken } = await readSessionCookies();

    if (refreshToken) await revokeRefreshToken(refreshToken);
    await clearSessionCookies();

    if (user) {
      await recordAudit({
        actorUserId: user.id,
        action: 'auth.sign_out',
        resourceType: 'user',
        resourceId: user.publicId,
      });
    }

    return ok({ signedOut: true }, requestId);
  } catch (error) {
    return fail(error, requestId);
  }
}
