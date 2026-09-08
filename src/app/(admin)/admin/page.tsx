import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { StatusChip } from '@/features/admin/components/data-table';
import { SERIES } from '@/features/admin/components/dashboard/chart-tokens';
import { RevenueChart } from '@/features/admin/components/dashboard/revenue-chart';
import { StatusChart } from '@/features/admin/components/dashboard/status-chart';
import { StatCard } from '@/features/admin/components/dashboard/stat-card';
import { TopProductsChart } from '@/features/admin/components/dashboard/top-products-chart';
import { getDashboardMetrics } from '@/features/admin/server/admin-queries';
import { formatPaise } from '@/lib/money';

export const metadata: Metadata = { title: 'Dashboard' };

/** Always current — a dashboard showing a cached figure is worse than useless. */
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  const revenueSpark = metrics.trend.map((point) => point.revenuePaise);
  const ordersSpark = metrics.trend.map((point) => point.orders);

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
          Dashboard
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          Performance across the last 30 days, compared with the 30 days before it.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Revenue"
            value={formatPaise(metrics.revenuePaise)}
            deltaPct={metrics.revenueDeltaPct}
            spark={revenueSpark}
            color={SERIES.revenue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Paid orders"
            value={String(metrics.paidOrders)}
            deltaPct={metrics.ordersDeltaPct}
            spark={ordersSpark}
            color={SERIES.orders}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Average order"
            value={formatPaise(metrics.averageOrderPaise)}
            deltaPct={metrics.aovDeltaPct}
            color={SERIES.units}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="New customers"
            value={String(metrics.newCustomers)}
            deltaPct={metrics.customersDeltaPct}
            color="#9085E9"
            hint={`of ${metrics.customers} total`}
          />
        </Grid>
      </Grid>

      {metrics.pendingOrders > 0 || metrics.lowStockCount > 0 ? (
        <Grid container spacing={2}>
          {metrics.pendingOrders > 0 ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <AlertCard
                tone="#FAB219"
                title={`${metrics.pendingOrders} order${metrics.pendingOrders === 1 ? '' : 's'} awaiting payment`}
                body="These are reserved but unpaid. Stock stays held until they are cancelled."
                href="/admin/orders"
                cta="Review orders"
              />
            </Grid>
          ) : null}
          {metrics.lowStockCount > 0 ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <AlertCard
                tone="#D03B3B"
                title={`${metrics.lowStockCount} variant${metrics.lowStockCount === 1 ? '' : 's'} low on stock`}
                body="At or below the low-stock threshold. Restock before they sell out."
                href="/admin/products"
                cta="Manage products"
              />
            </Grid>
          ) : null}
        </Grid>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <RevenueChart trend={metrics.trend} />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <StatusChart data={metrics.statusBreakdown} />
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <TopProductsChart products={metrics.topProducts} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}>Low stock</Typography>

            {metrics.lowStockItems.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                Every active variant is above its threshold.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {metrics.lowStockItems.map((item) => (
                  <Box
                    key={item.sku}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }} noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.sku}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: item.stock === 0 ? '#D03B3B' : '#FAB219',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Recent orders</Typography>
          <AdminLink href="/admin/orders">View all</AdminLink>
        </Box>

        {metrics.recentOrders.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No orders yet.
          </Typography>
        ) : (
          // The row separator is a CSS border rather than Stack's `divider`
          // prop: MUI clones that element between children, which does not
          // survive the Server Component boundary.
          <Stack>
            {metrics.recentOrders.map((order) => (
              <Box
                key={order.publicId}
                sx={{
                  py: 1.5,
                  display: 'grid',
                  gap: 1.5,
                  alignItems: 'center',
                  gridTemplateColumns: { xs: '1fr auto', sm: '1.2fr 1fr auto auto' },
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '&:first-of-type': { borderTop: 0 },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }} noWrap>
                    {order.orderNumber}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { sm: 'none' } }}
                  >
                    {order.customer}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}
                >
                  {order.customer}
                </Typography>

                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <StatusChip status={order.status} />
                </Box>

                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatPaise(order.grandTotalPaise)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}

function AlertCard({
  tone,
  title,
  body,
  href,
  cta,
}: {
  tone: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Card sx={{ p: 2, display: 'flex', gap: 1.75, height: '100%', alignItems: 'flex-start' }}>
      <Box
        aria-hidden
        sx={{ width: 3, alignSelf: 'stretch', borderRadius: 999, bgcolor: tone, flexShrink: 0 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          {body}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <AdminLink href={href}>{cta} →</AdminLink>
        </Box>
      </Box>
    </Card>
  );
}

/**
 * A Server Component cannot hand `Link` to MUI as `component={Link}` — that
 * passes a function across the server/client boundary. Rendering the anchor as
 * a child and styling it from the wrapper's `sx` keeps every prop serialisable.
 */
function AdminLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        '& a': {
          fontSize: 12.5,
          fontWeight: 600,
          color: 'primary.light',
          textDecoration: 'none',
        },
        '& a:hover': { textDecoration: 'underline' },
      }}
    >
      <Link href={href}>{children}</Link>
    </Box>
  );
}
