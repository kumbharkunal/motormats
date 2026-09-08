import Stack from '@mui/material/Stack';
import type { Metadata } from 'next';

import { PageHeader } from '@/features/admin/components/page-header';
import { ProductsTable } from '@/features/admin/components/products-table';
import { listAdminProducts } from '@/features/admin/server/admin-queries';

export const metadata: Metadata = { title: 'Products' };
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Products"
        subtitle="Every product in the catalogue, with variant count and stock on hand."
        count={products.length}
      />
      <ProductsTable products={products} />
    </Stack>
  );
}
