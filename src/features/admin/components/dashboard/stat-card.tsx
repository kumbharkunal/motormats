'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { STATUS } from '../admin-tokens';
import { INK } from './chart-tokens';

/**
 * A headline number is a stat tile, not a one-bar bar chart.
 *
 * The delta carries an arrow and a sign as well as a colour, so the direction
 * survives a colour-blind reader and a greyscale print.
 */
export function StatCard({
  label,
  value,
  deltaPct,
  spark,
  color,
  hint,
}: {
  label: string;
  value: string;
  deltaPct?: number | null;
  spark?: number[];
  color: string;
  hint?: string;
}) {
  const hasSpark = spark !== undefined && spark.length > 1 && spark.some((n) => n > 0);

  return (
    <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', fontSize: 10.5, display: 'block', lineHeight: 1.6 }}
          >
            {label}
          </Typography>
          <Typography sx={{ mt: 0.25, fontSize: 28, fontWeight: 700, lineHeight: 1.15 }}>
            {value}
          </Typography>
        </Box>
        <Box
          aria-hidden
          sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: color, mt: 1, flexShrink: 0 }}
        />
      </Box>

      <Box
        sx={{
          mt: 'auto',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <DeltaBadge deltaPct={deltaPct} hint={hint} />

        {hasSpark ? (
          <Box sx={{ width: 84, height: 34, flexShrink: 0 }}>
            <SparkLineChart
              data={spark}
              area
              curve="monotoneX"
              color={color}
              showHighlight
              showTooltip={false}
              height={34}
              margin={{ top: 4, bottom: 4, left: 0, right: 0 }}
              sx={{ '& .MuiLineChart-area': { opacity: 0.14 } }}
            />
          </Box>
        ) : null}
      </Box>
    </Card>
  );
}

function DeltaBadge({ deltaPct, hint }: { deltaPct?: number | null; hint?: string }) {
  if (deltaPct === undefined) {
    return (
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {hint ?? ''}
      </Typography>
    );
  }

  // No prior-period baseline is genuinely unknown, not "flat".
  if (deltaPct === null) {
    return (
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        No prior data
      </Typography>
    );
  }

  const rounded = Math.round(deltaPct);
  const flat = rounded === 0;
  const up = rounded > 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const tone = flat ? INK.muted : up ? STATUS.success : STATUS.error;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Icon size={14} color={tone} strokeWidth={2.4} aria-hidden />
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: tone }}>
        {flat ? '0%' : `${up ? '+' : ''}${rounded}%`}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
        {hint ?? 'vs prior 30d'}
      </Typography>
    </Box>
  );
}
