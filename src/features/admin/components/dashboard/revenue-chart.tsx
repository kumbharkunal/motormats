'use client';

import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useState } from 'react';

import type { TrendPoint } from '@/features/admin/types';
import { formatPaise } from '@/lib/money';

import { AXIS_STYLE, INK, SERIES } from './chart-tokens';
import { compactRupees } from './chart-tokens';

/**
 * Revenue and order count over the last 30 days.
 *
 * These are two different scales, so they are two views behind a toggle rather
 * than one chart with two y-axes — a dual-axis chart lets the reader infer a
 * correlation from where the designer happened to put the baselines.
 */
export function RevenueChart({ trend }: { trend: TrendPoint[] }) {
  const [view, setView] = useState<'revenue' | 'orders'>('revenue');

  const labels = trend.map((point) => {
    const date = new Date(`${point.date}T00:00:00`);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  });

  const total =
    view === 'revenue'
      ? formatPaise(trend.reduce((sum, p) => sum + p.revenuePaise, 0))
      : String(trend.reduce((sum, p) => sum + p.orders, 0));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
            {view === 'revenue' ? 'Revenue' : 'Orders'} · last 30 days
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
            {total}
          </Typography>
        </Box>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, next: 'revenue' | 'orders' | null) => next && setView(next)}
          aria-label="Chart measure"
          sx={{ '& .MuiToggleButton-root': { px: 1.75, py: 0.5, fontSize: 12.5, minHeight: 34 } }}
        >
          <ToggleButton value="revenue">Revenue</ToggleButton>
          <ToggleButton value="orders">Orders</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ flex: 1, minHeight: 260, width: '100%' }}>
        {view === 'revenue' ? (
          <LineChart
            height={260}
            series={[
              {
                data: trend.map((point) => point.revenuePaise),
                label: 'Revenue',
                color: SERIES.revenue,
                area: true,
                curve: 'monotoneX',
                showMark: false,
                valueFormatter: (value) => (value === null ? '—' : formatPaise(value)),
              },
            ]}
            xAxis={[{ scaleType: 'point', data: labels, ...AXIS_STYLE }]}
            yAxis={[{ valueFormatter: compactRupees, ...AXIS_STYLE }]}
            grid={{ horizontal: true }}
            hideLegend
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            sx={chartSx}
          />
        ) : (
          <BarChart
            height={260}
            series={[
              {
                data: trend.map((point) => point.orders),
                label: 'Orders',
                color: SERIES.orders,
                valueFormatter: (value) => (value === null ? '—' : String(value)),
              },
            ]}
            xAxis={[{ scaleType: 'band', data: labels, ...AXIS_STYLE }]}
            yAxis={[{ ...AXIS_STYLE }]}
            grid={{ horizontal: true }}
            hideLegend
            borderRadius={4}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            sx={chartSx}
          />
        )}
      </Box>
    </Box>
  );
}

/**
 * Recessive grid and axes; the data is the only thing that should draw the eye.
 *
 * The class names are x-charts v9's: the area is `MuiLineChart-area`, not the
 * v7 `MuiAreaElement-root`. The old selector matched nothing, which is why the
 * area was rendering at full opacity as a solid slab of brand red. The axis
 * rules are qualified through `MuiChartsAxis-root` because the component's own
 * styles land at the same specificity and would otherwise win on insertion order.
 */
const chartSx = {
  '& .MuiChartsGrid-line': { stroke: INK.grid },
  '& .MuiChartsAxis-root .MuiChartsAxis-line': { stroke: INK.axis },
  '& .MuiChartsAxis-root .MuiChartsAxis-tick': { stroke: INK.axis },
  '& .MuiLineChart-area': { opacity: 0.12 },
  '& .MuiLineChart-line': { strokeWidth: 2 },
} as const;
