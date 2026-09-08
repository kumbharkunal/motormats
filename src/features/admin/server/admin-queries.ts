import 'server-only';

import { and, count, desc, eq, gte, inArray, lt, sql, sum } from 'drizzle-orm';

import { db } from '@db/client';
import { productVariants, products } from '@db/schema/catalog';
import { orderItems, orders } from '@db/schema/commerce';
import { users } from '@db/schema/identity';

import { requireAdminSession, requirePermission } from '@/lib/auth/current-user';
import type { TrendPoint } from '@/features/admin/types';

/**
 * Money is only recognised once payment succeeded. A shipped or delivered order
 * is still revenue — filtering on `paid` alone would drop an order out of the
 * totals the moment it moves to fulfilment.
 */
const REVENUE_STATUSES = ['paid', 'processing', 'shipped', 'delivered'] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/** `null` means "no baseline to compare against", which is not the same as 0%. */
function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

/**
 * Admin reads.
 *
 * Every function calls `requirePermission` itself rather than relying on the
 * layout having done so. A page can be refactored or a query reused from a
 * route handler; the authorisation must travel with the data access.
 */

export type { TrendPoint };

export type DashboardMetrics = {
  revenuePaise: number;
  revenueDeltaPct: number | null;
  paidOrders: number;
  ordersDeltaPct: number | null;
  averageOrderPaise: number;
  aovDeltaPct: number | null;
  pendingOrders: number;
  customers: number;
  newCustomers: number;
  customersDeltaPct: number | null;
  lowStockCount: number;
  /** One point per day for the last 30 days, gaps filled with zeroes. */
  trend: TrendPoint[];
  statusBreakdown: { status: string; count: number }[];
  topProducts: { name: string; revenuePaise: number; units: number }[];
  lowStockItems: { name: string; sku: string; stock: number; threshold: number }[];
  recentOrders: {
    publicId: string;
    orderNumber: string;
    status: string;
    grandTotalPaise: number;
    customer: string;
    createdAt: Date;
  }[];
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await requirePermission('admin:access');

  const now = Date.now();
  const windowStart = new Date(now - 30 * DAY_MS);
  // The equal-length window immediately before, so the deltas compare like with like.
  const priorStart = new Date(now - 60 * DAY_MS);

  const isRevenue = inArray(orders.status, REVENUE_STATUSES);

  const [
    current,
    prior,
    priorCustomers,
    pending,
    customers,
    newCustomers,
    lowStock,
    daily,
    byStatus,
    top,
    lowStockRows,
    recent,
  ] = await Promise.all([
    db
      .select({ total: sum(orders.grandTotalPaise), orderCount: count() })
      .from(orders)
      .where(and(isRevenue, gte(orders.createdAt, windowStart))),

    db
      .select({ total: sum(orders.grandTotalPaise), orderCount: count() })
      .from(orders)
      .where(and(isRevenue, gte(orders.createdAt, priorStart), lt(orders.createdAt, windowStart))),

    db
      .select({ total: count() })
      .from(users)
      .where(
        and(
          eq(users.role, 'customer'),
          gte(users.createdAt, priorStart),
          lt(users.createdAt, windowStart),
        ),
      ),

    db.select({ total: count() }).from(orders).where(eq(orders.status, 'pending_payment')),

    db.select({ total: count() }).from(users).where(eq(users.role, 'customer')),

    db
      .select({ total: count() })
      .from(users)
      .where(and(eq(users.role, 'customer'), gte(users.createdAt, windowStart))),

    db
      .select({ total: count() })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.isActive, true),
          sql`${productVariants.stockQuantity} <= ${productVariants.lowStockThreshold}`,
        ),
      ),

    db
      .select({
        day: sql<string>`DATE(${orders.createdAt})`,
        revenue: sum(orders.grandTotalPaise),
        orderCount: count(),
      })
      .from(orders)
      .where(and(isRevenue, gte(orders.createdAt, windowStart)))
      .groupBy(sql`DATE(${orders.createdAt})`),

    db
      .select({ status: orders.status, total: count() })
      .from(orders)
      .where(gte(orders.createdAt, windowStart))
      .groupBy(orders.status),

    db
      .select({
        name: orderItems.productName,
        revenue: sum(orderItems.lineTotalPaise),
        units: sum(orderItems.quantity),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(isRevenue, gte(orders.createdAt, windowStart)))
      .groupBy(orderItems.productName)
      .orderBy(desc(sum(orderItems.lineTotalPaise)))
      .limit(5),

    db
      .select({
        name: products.name,
        sku: productVariants.sku,
        stock: productVariants.stockQuantity,
        threshold: productVariants.lowStockThreshold,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(
        and(
          eq(productVariants.isActive, true),
          sql`${productVariants.stockQuantity} <= ${productVariants.lowStockThreshold}`,
        ),
      )
      .orderBy(productVariants.stockQuantity)
      .limit(6),

    db
      .select({
        publicId: orders.publicId,
        orderNumber: orders.orderNumber,
        status: orders.status,
        grandTotalPaise: orders.grandTotalPaise,
        createdAt: orders.createdAt,
        name: users.name,
        phone: users.phone,
      })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.userId))
      .orderBy(desc(orders.id))
      .limit(8),
  ]);

  // SUM() comes back as a decimal string from the driver.
  const revenuePaise = Number(current[0]?.total ?? 0);
  const paidOrders = current[0]?.orderCount ?? 0;
  const priorRevenue = Number(prior[0]?.total ?? 0);
  const priorOrders = prior[0]?.orderCount ?? 0;

  const averageOrderPaise = paidOrders === 0 ? 0 : Math.round(revenuePaise / paidOrders);
  const priorAverage = priorOrders === 0 ? 0 : Math.round(priorRevenue / priorOrders);

  // A day with no orders still needs a point, or the line lies about its shape.
  const byDay = new Map(
    daily.map((row) => [
      String(row.day),
      { revenuePaise: Number(row.revenue ?? 0), orders: row.orderCount },
    ]),
  );

  const trend: TrendPoint[] = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now - (29 - index) * DAY_MS);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const hit = byDay.get(key);
    return { date: key, revenuePaise: hit?.revenuePaise ?? 0, orders: hit?.orders ?? 0 };
  });

  return {
    revenuePaise,
    revenueDeltaPct: percentChange(revenuePaise, priorRevenue),
    paidOrders,
    ordersDeltaPct: percentChange(paidOrders, priorOrders),
    averageOrderPaise,
    aovDeltaPct: percentChange(averageOrderPaise, priorAverage),
    pendingOrders: pending[0]?.total ?? 0,
    customers: customers[0]?.total ?? 0,
    newCustomers: newCustomers[0]?.total ?? 0,
    customersDeltaPct: percentChange(newCustomers[0]?.total ?? 0, priorCustomers[0]?.total ?? 0),
    lowStockCount: lowStock[0]?.total ?? 0,
    trend,
    statusBreakdown: byStatus.map((row) => ({ status: row.status, count: row.total })),
    topProducts: top.map((row) => ({
      name: row.name,
      revenuePaise: Number(row.revenue ?? 0),
      units: Number(row.units ?? 0),
    })),
    lowStockItems: lowStockRows,
    recentOrders: recent.map((row) => ({
      publicId: row.publicId,
      orderNumber: row.orderNumber,
      status: row.status,
      grandTotalPaise: row.grandTotalPaise,
      customer: row.name ?? row.phone ?? 'Guest',
      createdAt: row.createdAt,
    })),
  };
}

export type AdminProductRow = {
  publicId: string;
  name: string;
  slug: string;
  status: string;
  basePricePaise: number;
  variantCount: number;
  totalStock: number;
};

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  // Not `product:read` — customers hold that, and this row exposes draft status
  // and stock levels the storefront never shows.
  await requireAdminSession();

  const rows = await db
    .select({
      publicId: products.publicId,
      name: products.name,
      slug: products.slug,
      status: products.status,
      basePricePaise: products.basePricePaise,
      variantCount: sql<number>`COUNT(${productVariants.id})`,
      totalStock: sql<number>`COALESCE(SUM(${productVariants.stockQuantity}), 0)`,
    })
    .from(products)
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .groupBy(products.id)
    .orderBy(desc(products.id));

  return rows.map((row) => ({
    ...row,
    variantCount: Number(row.variantCount),
    totalStock: Number(row.totalStock),
  }));
}

export type AdminUserRow = {
  publicId: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  status: string;
  orderCount: number;
  createdAt: Date;
};

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  await requirePermission('user:read');

  const rows = await db
    .select({
      publicId: users.publicId,
      name: users.name,
      phone: users.phone,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      orderCount: sql<number>`COUNT(${orders.id})`,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.id))
    .limit(200);

  return rows.map((row) => ({ ...row, orderCount: Number(row.orderCount) }));
}

export type AdminOrderRow = {
  publicId: string;
  orderNumber: string;
  status: string;
  grandTotalPaise: number;
  customer: string;
  createdAt: Date;
};

export async function listAdminOrders(): Promise<AdminOrderRow[]> {
  await requirePermission('order:read:any');

  const rows = await db
    .select({
      publicId: orders.publicId,
      orderNumber: orders.orderNumber,
      status: orders.status,
      grandTotalPaise: orders.grandTotalPaise,
      createdAt: orders.createdAt,
      name: users.name,
      phone: users.phone,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .orderBy(desc(orders.id))
    .limit(200);

  return rows.map((row) => ({
    publicId: row.publicId,
    orderNumber: row.orderNumber,
    status: row.status,
    grandTotalPaise: row.grandTotalPaise,
    customer: row.name ?? row.phone ?? 'Guest',
    createdAt: row.createdAt,
  }));
}
