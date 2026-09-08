import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminShell } from '@/features/admin/components/admin-shell';
import { AdminTheme } from '@/features/admin/components/admin-theme';
import { getCurrentUser } from '@/lib/auth/current-user';
import { can } from '@/lib/auth/rbac';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Motormats Admin' },
  robots: { index: false, follow: false },
};

/**
 * The authoritative admin gate. `proxy.ts` only checks that a session cookie
 * exists, which is a UX nicety; this verifies the session and the permission.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/admin');
  if (!can(user.role, 'admin:access')) redirect('/');

  return (
    <AdminTheme>
      <AdminShell email={user.email ?? user.phone ?? 'Signed in'}>{children}</AdminShell>
    </AdminTheme>
  );
}
