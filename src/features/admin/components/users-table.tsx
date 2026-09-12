'use client';

import Chip from '@mui/material/Chip';

import {
  ResponsiveDataTable,
  StatusChip,
  type Column,
} from '@/features/admin/components/data-table';
import type { AdminUserRow } from '@/features/admin/server/admin-queries';

type Row = AdminUserRow & { id: string };

const columns: Column<Row>[] = [
  {
    field: 'name',
    header: 'Customer',
    primary: true,
    flex: 2,
    render: (row) => row.name ?? row.phone ?? row.email ?? 'Unnamed',
  },
  { field: 'phone', header: 'Phone', flex: 1, render: (row) => row.phone ?? '—' },
  { field: 'email', header: 'Email', flex: 2, render: (row) => row.email ?? '—' },
  {
    field: 'role',
    header: 'Role',
    width: 140,
    render: (row) => (
      <Chip
        size="small"
        label={row.role.replace(/_/g, ' ')}
        variant="outlined"
        color={row.role === 'customer' ? 'default' : 'primary'}
        sx={{ textTransform: 'capitalize' }}
      />
    ),
  },
  {
    field: 'status',
    header: 'Status',
    width: 130,
    render: (row) => <StatusChip status={row.status} />,
  },
  { field: 'orderCount', header: 'Orders', width: 100, render: (row) => String(row.orderCount) },
];

export function UsersTable({ users }: { users: AdminUserRow[] }) {
  const rows: Row[] = users.map((user) => ({ ...user, id: user.publicId }));
  return <ResponsiveDataTable rows={rows} columns={columns} emptyMessage="No users yet." />;
}
