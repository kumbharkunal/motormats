import { redirect } from 'next/navigation';

/** The dashboard lives at /admin/dashboard; keep the bare /admin URL working. */
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
