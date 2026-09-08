import type { Metadata } from 'next';

import { AdminForgotPasswordForm } from '@/features/admin/components/admin-forgot-password-form';

export const metadata: Metadata = {
  title: 'Reset password',
  robots: { index: false, follow: false },
};

/**
 * No redirect for an already-signed-in admin: rotating your own password while
 * logged in is legitimate, and no other page offers it.
 */
export default function AdminForgotPasswordPage() {
  return <AdminForgotPasswordForm />;
}
