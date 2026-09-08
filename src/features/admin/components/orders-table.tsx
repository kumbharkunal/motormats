'use client';

import { useRouter } from 'next/navigation';

import { ResponsiveDataTable, StatusChip, type Column } from '@/features/admin/components/data-table';
import type { AdminOrderRow } from '@/features/admin/server/admin-queries';
import { formatPaise } from '@/lib/money';

type Row = AdminOrderRow & { id: string };

const columns: Column<Row>[] = [
  { field: 'orderNumber', header: 'Order', primary: true, flex: 1, render: (row) => row.orderNumber },
  { field: 'customer', header: 'Customer', flex: 1, render: (row) => row.customer },
  { field: 'status', header: 'Status', width: 160, render: (row) => <StatusChip status={row.status} /> },
  {
    field: 'grandTotalPaise',
    header: 'Total',
    width: 140,
    render: (row) => formatPaise(row.grandTotalPaise),
  },
  {
    field: 'createdAt',
    header: 'Placed',
    width: 150,
    render: (row) =>
      row.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  },
];

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  const router = useRouter();
  const rows: Row[] = orders.map((order) => ({ ...order, id: order.publicId }));

  return (
    <ResponsiveDataTable
      rows={rows}
      columns={columns}
      emptyMessage="No orders yet."
      onRowClick={(row) => router.push('/orders/' + row.publicId)}
    />
  );
}
