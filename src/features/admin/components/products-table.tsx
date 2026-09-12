'use client';

import Typography from '@mui/material/Typography';

import {
  ResponsiveDataTable,
  StatusChip,
  type Column,
} from '@/features/admin/components/data-table';
import type { AdminProductRow } from '@/features/admin/server/admin-queries';
import { formatPaise } from '@/lib/money';

type Row = AdminProductRow & { id: string };

const columns: Column<Row>[] = [
  { field: 'name', header: 'Product', primary: true, flex: 2, render: (row) => row.name },
  {
    field: 'status',
    header: 'Status',
    width: 130,
    render: (row) => <StatusChip status={row.status} />,
  },
  {
    field: 'basePricePaise',
    header: 'Base price',
    width: 140,
    render: (row) => formatPaise(row.basePricePaise),
  },
  {
    field: 'variantCount',
    header: 'Variants',
    width: 110,
    render: (row) => String(row.variantCount),
  },
  {
    field: 'totalStock',
    header: 'Stock',
    width: 110,
    render: (row) => (
      <Typography
        component="span"
        sx={{ fontSize: 14, color: row.totalStock === 0 ? 'error.main' : 'text.primary' }}
      >
        {row.totalStock}
      </Typography>
    ),
  },
];

export function ProductsTable({ products }: { products: AdminProductRow[] }) {
  const rows: Row[] = products.map((product) => ({ ...product, id: product.publicId }));
  return <ResponsiveDataTable rows={rows} columns={columns} emptyMessage="No products yet." />;
}
