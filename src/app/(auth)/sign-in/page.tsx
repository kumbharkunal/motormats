import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { SignInForm } from '@/features/auth/components/sign-in-form';
import { getCurrentUser } from '@/lib/auth/current-user';

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

  // Only same-site relative paths are honoured, so `?next=` cannot be used to
  // bounce a signed-in visitor to another origin.
  const destination = next && /^\/(?!\/)/.test(next) ? next : '/';

  if (user) redirect(destination);

  return <SignInForm next={destination} />;
}
