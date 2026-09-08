import Stack from '@mui/material/Stack';
import type { Metadata } from 'next';

import { OrdersTable } from '@/features/admin/components/orders-table';
import { PageHeader } from '@/features/admin/components/page-header';
import { listAdminOrders } from '@/features/admin/server/admin-queries';

export const metadata: Metadata = { title: 'Orders' };
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Orders"
        subtitle="The 200 most recent orders. Select a row to open the full order."
        count={orders.length}
      />
      <OrdersTable orders={orders} />
    </Stack>
  );
}
