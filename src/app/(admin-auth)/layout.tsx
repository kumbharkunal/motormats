import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { AdminTheme } from '@/features/admin/components/admin-theme';

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
 * Deliberately separate from the `(admin)` group: that layout is the auth gate,
 * so a sign-in page living under it would redirect the visitor away before they
 * could ever sign in. This one carries the theme and nothing else.
 */
export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return <AdminTheme>{children}</AdminTheme>;
}
