import 'server-only';

import { and, desc, eq } from 'drizzle-orm';

import { db } from '@db/client';
import { orderItems, orders, payments } from '@db/schema/commerce';

export async function listOrdersForUser(userId: number, limit = 20) {
  return db
    .select({
      publicId: orders.publicId,
      orderNumber: orders.orderNumber,
      status: orders.status,
      grandTotalPaise: orders.grandTotalPaise,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.id))
    .limit(limit);
}

export async function getOrderForUser(userId: number, publicId: string) {
  const [order] = await db
    .select({
      id: orders.id,
      publicId: orders.publicId,
      orderNumber: orders.orderNumber,
      status: orders.status,
      shippingAddress: orders.shippingAddress,
      subtotalPaise: orders.subtotalPaise,
      discountPaise: orders.discountPaise,
      shippingPaise: orders.shippingPaise,
      taxPaise: orders.taxPaise,
      grandTotalPaise: orders.grandTotalPaise,
      couponCode: orders.couponCode,
      createdAt: orders.createdAt,
      placedAt: orders.placedAt,
    })
    .from(orders)
    .where(and(eq(orders.publicId, publicId), eq(orders.userId, userId)))
    .limit(1);

  if (!order) return null;

  const [items, paymentRows] = await Promise.all([
    db
      .select({
        productName: orderItems.productName,
        variantName: orderItems.variantName,
        sku: orderItems.sku,
        productSlug: orderItems.productSlug,
        imageAssetId: orderItems.imageAssetId,
        unitPricePaise: orderItems.unitPricePaise,
        quantity: orderItems.quantity,
        lineTotalPaise: orderItems.lineTotalPaise,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id)),
    db
      .select({ status: payments.status, capturedAt: payments.capturedAt })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(desc(payments.id))
      .limit(1),
  ]);

  return { ...order, items, payment: paymentRows[0] ?? null };
}
