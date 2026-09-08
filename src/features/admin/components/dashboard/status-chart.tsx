'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';

import { statusColor, statusLabel } from './chart-tokens';

/**
 * Order mix for the last 30 days.
 *
 * A donut is defensible here because the reader's job is part-to-whole across a
 * handful of states. Every slice is also listed with its name and count below,
 * so the breakdown is readable without relying on colour at all.
 */
export function StatusChart({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  if (total === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          No orders in the last 30 days.
        </Typography>
      </Box>
    );
  }

  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Order status · 30 days</Typography>

      <Box sx={{ position: 'relative', height: 208 }}>
        <PieChart
          height={208}
          series={[
            {
              data: sorted.map((row) => ({
                id: row.status,
                value: row.count,
                label: statusLabel(row.status),
                color: statusColor(row.status),
              })),
              innerRadius: 62,
              outerRadius: 92,
              paddingAngle: 2,
              cornerRadius: 4,
              highlightScope: { highlight: 'item', fade: 'global' },
            },
          ]}
          hideLegend
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        />

        {/* The whole is the number the reader wants; put it where the hole is. */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{total}</Typography>
            <Typography variant="caption" color="text.secondary">
              orders
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sorted.map((row) => (
          <Box key={row.status} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              aria-hidden
              sx={{
                width: 9,
                height: 9,
                borderRadius: 999,
                bgcolor: statusColor(row.status),
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: 13, flex: 1, minWidth: 0 }} noWrap>
              {statusLabel(row.status)}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {row.count}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ width: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
            >
              {Math.round((row.count / total) * 100)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
