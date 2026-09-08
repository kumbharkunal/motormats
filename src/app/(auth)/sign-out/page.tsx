import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/current-user';
import { clearSessionCookies, readSessionCookies, revokeRefreshToken } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';
import { SignOutConfirm } from '@/features/auth/components/sign-out-confirm';

export const metadata: Metadata = {
  title: 'Sign out',
  robots: { index: false, follow: false },
};

/**
 * Signing out is a state change, so it happens on POST via a form rather than
 * on GET — a prefetch or a link preview must not be able to end a session.
 */
export default async function SignOutPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  async function signOut() {
    'use server';

    const current = await getCurrentUser();
    const { refreshToken } = await readSessionCookies();

    if (refreshToken) await revokeRefreshToken(refreshToken);
    await clearSessionCookies();

    if (current) {
      await recordAudit({
        actorUserId: current.id,
        action: 'auth.sign_out',
        resourceType: 'user',
        resourceId: current.publicId,
      });
    }

    redirect('/');
  }

  return <SignOutConfirm action={signOut} name={user.name ?? user.phone ?? 'your account'} />;
}
