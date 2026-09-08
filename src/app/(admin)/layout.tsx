import type { Metadata, Viewport } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminShell } from '@/features/admin/components/admin-shell';
import { AdminTheme } from '@/features/admin/components/admin-theme';
import { ADMIN_PROVIDER, getCurrentUser } from '@/lib/auth/current-user';
import { can } from '@/lib/auth/rbac';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Motormats Admin' },
  robots: { index: false, follow: false },
};

/**
 * The root layout declares a dark scheme for the storefront. Viewport fields
 * merge per-field down the tree, so this relights only the admin routes and
 * leaves width / initialScale / viewportFit inherited.
 */
export const viewport: Viewport = { themeColor: '#FFFFFF', colorScheme: 'light' };

/**
 * The authoritative admin gate. `proxy.ts` only checks that a session cookie
 * exists, which is a UX nicety; this verifies the session and the permission.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/sign-in');
  if (!can(user.role, 'admin:access')) redirect('/');
  // Correct role, wrong door: this session came from OTP or Google.
  if (user.signInProvider !== ADMIN_PROVIDER) redirect('/admin/sign-in?error=provider');

  return (
    <AdminTheme>
      <AdminShell email={user.email ?? user.phone ?? 'Signed in'}>{children}</AdminShell>
    </AdminTheme>
  );
}
