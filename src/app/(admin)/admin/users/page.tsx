import Stack from '@mui/material/Stack';
import type { Metadata } from 'next';

import { PageHeader } from '@/features/admin/components/page-header';
import { UsersTable } from '@/features/admin/components/users-table';
import { listAdminUsers } from '@/features/admin/server/admin-queries';

export const metadata: Metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await listAdminUsers();

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Users"
        subtitle="Registered accounts with their role, status and lifetime order count."
        count={users.length}
      />
      <UsersTable users={users} />
    </Stack>
  );
}
