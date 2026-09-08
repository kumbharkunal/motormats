import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AdminSignInForm } from '@/features/admin/components/admin-sign-in-form';
import { ADMIN_PROVIDER, getCurrentUser } from '@/lib/auth/current-user';
import { can } from '@/lib/auth/rbac';
import { safeNextPath } from '@/lib/auth/safe-next-path';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const user = await getCurrentUser();

  // Restricted to /admin/ so a sign-in here can never bounce out to the storefront.
  const destination = safeNextPath(next, '/admin/dashboard', '/admin/');

  const isSignedInAdmin =
    user !== null && can(user.role, 'admin:access') && user.signInProvider === ADMIN_PROVIDER;

  if (isSignedInAdmin) redirect(destination);

  return <AdminSignInForm next={destination} initialError={error} />;
}
