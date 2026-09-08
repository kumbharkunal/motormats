'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { formatPaise } from '@/lib/money';

import { SERIES } from './chart-tokens';

/**
 * Best sellers by revenue.
 *
 * Drawn as plain HTML bars rather than a chart component: with five rows and
 * long product names, a horizontal bar list gives every row a full-width label
 * and a directly-attached value, which a rotated axis cannot.
 */
export function TopProductsChart({
  products,
}: {
  products: { name: string; revenuePaise: number; units: number }[];
}) {
  if (products.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          No sales in the last 30 days.
        </Typography>
      </Box>
    );
  }

  const max = Math.max(...products.map((product) => product.revenuePaise), 1);

  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}>
        Top products · 30 days
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {products.map((product, index) => (
          <Box key={product.name}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 0.75 }}>
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', width: 16 }}
                aria-hidden
              >
                {index + 1}
              </Typography>
              <Typography sx={{ fontSize: 13.5, flex: 1, minWidth: 0 }} noWrap title={product.name}>
                {product.name}
              </Typography>
              <Typography
                sx={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
              >
                {formatPaise(product.revenuePaise)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 3.5 }}>
              <Box
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${Math.max((product.revenuePaise / max) * 100, 2)}%`,
                    height: '100%',
                    borderRadius: 999,
                    // One hue, magnitude by length — the leader is darkest.
                    bgcolor: SERIES.units,
                    opacity: 1 - index * 0.14,
                    transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ width: 62, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
              >
                {product.units} sold
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
