import 'server-only';

import { and, eq, gte, sql } from 'drizzle-orm';

import { db } from '@db/client';
import { productVariants } from '@db/schema/catalog';
import {
  addresses,
  couponRedemptions,
  orderItems,
  orders,
  type OrderStatus,
} from '@db/schema/commerce';

import { resolveCart, type ClientCartLine } from '@/features/cart/server/resolve-cart';
import { claimCouponUsage, validateCoupon } from '@/features/coupons/server/coupon-service';
import { computeCartTotals } from '@/features/pricing/pricing';
import { AppError } from '@/lib/api/errors';
import { affectedRows } from '@/lib/db-result';
import { newPublicId } from '@/lib/ids';
import { logger } from '@/lib/logger';

export type CreateOrderInput = {
  userId: number;
  lines: ClientCartLine[];
  shippingAddressPublicId: string;
  couponCode?: string | undefined;
  customerNote?: string | undefined;
};

export type CreatedOrder = {
  orderId: number;
  publicId: string;
  orderNumber: string;
  grandTotalPaise: number;
};

export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const [address] = await db
    .select({
      id: addresses.id,
      fullName: addresses.fullName,
      phone: addresses.phone,
      line1: addresses.line1,
      line2: addresses.line2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      countryCode: addresses.countryCode,
    })
    .from(addresses)
    .where(
      and(
        eq(addresses.publicId, input.shippingAddressPublicId),
        eq(addresses.userId, input.userId),
      ),
    )
    .limit(1);

  if (!address) throw new AppError('NOT_FOUND');

  const cart = await resolveCart(input.lines);
  if (cart.lines.length === 0) throw new AppError('CART_EMPTY');

  if (cart.removed.length > 0 || cart.adjusted.length > 0) {
    throw new AppError('PRICE_CHANGED');
  }

  const coupon = input.couponCode
    ? await validateCoupon(input.couponCode, input.userId, cart.totals.subtotalPaise)
    : null;

  const totals = computeCartTotals(
    cart.lines.map((line) => ({
      variantPublicId: line.variantPublicId,
      quantity: line.quantity,
      unitPricePaise: line.unitPricePaise,
      taxRateBps: line.taxRateBps,
    })),
    coupon?.discount ?? { kind: 'none' },
  );

  const publicId = newPublicId();
  const orderNumber = buildOrderNumber();

  return db.transaction(async (tx) => {
    for (const line of cart.lines) {
      const result = await tx
        .update(productVariants)
        .set({ stockQuantity: sql`${productVariants.stockQuantity} - ${line.quantity}` })
        .where(
          and(
            eq(productVariants.publicId, line.variantPublicId),
            eq(productVariants.isActive, true),
            gte(productVariants.stockQuantity, line.quantity),
          ),
        );

      if (affectedRows(result) === 0) {
        throw new AppError('INSUFFICIENT_STOCK', {
          detail: { variantPublicId: line.variantPublicId },
        });
      }
    }

    if (coupon) await claimCouponUsage(tx, coupon.id);

    const [inserted] = await tx.insert(orders).values({
      publicId,
      orderNumber,
      userId: input.userId,
      status: 'pending_payment',
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        countryCode: address.countryCode,
      },
      subtotalPaise: totals.subtotalPaise,
      discountPaise: totals.discountPaise,
      shippingPaise: totals.shippingPaise,
      taxPaise: totals.taxPaise,
      grandTotalPaise: totals.grandTotalPaise,
      couponCode: coupon?.code ?? null,
      customerNote: input.customerNote ?? null,
    });

    const orderId = inserted.insertId;

    await tx.insert(orderItems).values(
      cart.lines.map((line) => ({
        orderId,
        variantId: line.variantId,
        productName: line.productName,
        variantName: line.variantName,
        sku: line.sku,
        productSlug: line.productSlug,
        imageAssetId: line.imageAssetId,
        unitPricePaise: line.unitPricePaise,
        quantity: line.quantity,
        taxRateBps: line.taxRateBps,
        lineTotalPaise: line.lineTotalPaise,
      })),
    );

    if (coupon) {
      await tx.insert(couponRedemptions).values({
        couponId: coupon.id,
        userId: input.userId,
        orderId,
        discountPaise: totals.discountPaise,
      });
    }

    logger.info(
      { orderNumber, grandTotalPaise: totals.grandTotalPaise, lines: cart.lines.length },
      'order created',
    );

    return { orderId, publicId, orderNumber, grandTotalPaise: totals.grandTotalPaise };
  });
}

export async function cancelUnpaidOrder(orderId: number, reason: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const result = await tx
      .update(orders)
      .set({ status: 'cancelled', cancelledAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.status, 'pending_payment')));

    if (affectedRows(result) === 0) return false;

    const items = await tx
      .select({ variantId: orderItems.variantId, quantity: orderItems.quantity })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      if (item.variantId === null) continue;
      await tx
        .update(productVariants)
        .set({ stockQuantity: sql`${productVariants.stockQuantity} + ${item.quantity}` })
        .where(eq(productVariants.id, item.variantId));
    }

    logger.info({ orderId, reason }, 'unpaid order cancelled and stock released');
    return true;
  });
}

export async function transitionOrderStatus(
  orderId: number,
  from: OrderStatus[],
  to: OrderStatus,
): Promise<boolean> {
  const result = await db
    .update(orders)
    .set({ status: to, ...(to === 'paid' ? { placedAt: new Date() } : {}) })
    .where(and(eq(orders.id, orderId), inStatuses(from)));

  return affectedRows(result) > 0;
}

function inStatuses(statuses: OrderStatus[]) {
  return sql`${orders.status} IN (${sql.join(
    statuses.map((status) => sql`${status}`),
    sql`, `,
  )})`;
}

function buildOrderNumber(): string {
  const now = new Date();
  const stamp = [
    now.getUTCFullYear().toString().slice(2),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
  ].join('');
  const random = newPublicId().slice(-6);
  return `MM${stamp}${random}`;
}
