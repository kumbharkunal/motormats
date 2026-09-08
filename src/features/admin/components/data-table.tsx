'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

export type Column<T> = {
  field: string;
  header: string;
  /** Rendered in both the grid and the mobile card. */
  render: (row: T) => React.ReactNode;
  /** Shown as the card's title on mobile. */
  primary?: boolean;
  width?: number;
  flex?: number;
};

/**
 * One table definition, two presentations.
 *
 * A DataGrid on a phone means horizontal scrolling, which the project rules
 * forbid. Below `md` the same columns are rendered as stacked cards instead, so
 * the admin panel is genuinely usable on a small screen rather than a desktop
 * layout squeezed onto one.
 */
export function ResponsiveDataTable<T extends { id: string }>({
  rows,
  columns,
  emptyMessage = 'Nothing here yet.',
  onRowClick,
}: {
  rows: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));

  if (rows.length === 0) {
    return (
      <Card sx={{ p: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Stack spacing={1.5}>
        {rows.map((row) => {
          const primary = columns.find((column) => column.primary) ?? columns[0]!;
          const rest = columns.filter((column) => column !== primary);

          return (
            <Card
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{
                p: 2,
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'border-color 200ms ease, transform 120ms ease',
                '&:active': onRowClick ? { transform: 'scale(0.995)' } : undefined,
                ...(onRowClick
                  ? { '&:hover': { borderColor: 'rgba(255,255,255,0.16)' } }
                  : undefined),
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{primary.render(row)}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1}>
                {rest.map((column) => (
                  <Box
                    key={column.field}
                    sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {column.header}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'right', minWidth: 0 }}>
                      {column.render(row)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          );
        })}
      </Stack>
    );
  }

  const gridColumns: GridColDef[] = columns.map((column) => ({
    field: column.field,
    headerName: column.header,
    sortable: true,
    ...(column.width ? { width: column.width } : { flex: column.flex ?? 1 }),
    renderCell: (params) => column.render(params.row as T),
  }));

  return (
    <Card>
      <DataGrid
        rows={rows}
        columns={gridColumns}
        disableRowSelectionOnClick
        onRowClick={onRowClick ? (params) => onRowClick(params.row as T) : undefined}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        pageSizeOptions={[25, 50, 100]}
        sx={{
          border: 0,
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid', borderColor: 'divider' },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          },
          '& .MuiDataGrid-cell': { borderColor: 'divider', fontSize: 13.5 },
          '& .MuiDataGrid-row': {
            cursor: onRowClick ? 'pointer' : 'default',
            transition: 'background-color 150ms ease',
          },
          '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
          '& .MuiDataGrid-footerContainer': { borderColor: 'divider' },
        }}
        autoHeight
      />
    </Card>
  );
}

export function StatusChip({ status }: { status: string }) {
  const tone: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
    paid: 'success',
    delivered: 'success',
    active: 'success',
    shipped: 'info',
    processing: 'info',
    pending_payment: 'warning',
    draft: 'warning',
    cancelled: 'error',
    refunded: 'error',
    suspended: 'error',
    archived: 'default',
  };

  return (
    <Chip
      size="small"
      label={status.replace(/_/g, ' ')}
      color={tone[status] ?? 'default'}
      variant="outlined"
      sx={{ textTransform: 'capitalize' }}
    />
  );
}
