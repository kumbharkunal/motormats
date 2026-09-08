import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { SignInForm } from '@/features/auth/components/sign-in-form';
import { getCurrentUser } from '@/lib/auth/current-user';
import { safeNextPath } from '@/lib/auth/safe-next-path';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;

  // A deep link still wins: arriving from /checkout returns there, not to the
  // default landing page.
  const destination = safeNextPath(next, '/collections');

  if (user) redirect(destination);

  return <SignInForm next={destination} />;
}
