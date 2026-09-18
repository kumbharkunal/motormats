import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { db, pool } from '@db/client';
import { productVariants } from '@db/schema/catalog';
import {
  addresses,
  couponRedemptions,
  coupons,
  orderItems,
  orders,
  payments,
} from '@db/schema/commerce';
import { users } from '@db/schema/identity';

import { cancelUnpaidOrder, createOrder } from '@/features/orders/server/order-service';
import { AppError } from '@/lib/api/errors';
import { newPublicId } from '@/lib/ids';

/**
 * Order creation against a real MySQL.
 *
 * These are the tests that matter most: they cover the paths where a bug costs
 * money — overselling under concurrency, coupon limits under races, and the
 * guarantee that a paid order's history cannot be rewritten by later catalogue
 * edits.
 */

let userId: number;
let otherUserId: number;
let addressPublicId: string;
let foreignAddressPublicId: string;
let variantPublicId: string;
let variantId: number;

async function setStock(quantity: number) {
  await db
    .update(productVariants)
    .set({ stockQuantity: quantity })
    .where(eq(productVariants.id, variantId));
}

beforeAll(async () => {
  const makeUser = async () => {
    const publicId = newPublicId();
    const [row] = await db.insert(users).values({
      publicId,
      firebaseUid: `order-test-${publicId}`,
      role: 'customer',
      status: 'active',
    });
    return row.insertId;
  };

  userId = await makeUser();
  otherUserId = await makeUser();

  const makeAddress = async (owner: number) => {
    const publicId = newPublicId();
    await db.insert(addresses).values({
      publicId,
      userId: owner,
      fullName: 'Test Customer',
      phone: '9999999999',
      line1: '1 Test Street',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
    });
    return publicId;
  };

  addressPublicId = await makeAddress(userId);
  foreignAddressPublicId = await makeAddress(otherUserId);

  const [variant] = await db
    .select({ id: productVariants.id, publicId: productVariants.publicId })
    .from(productVariants)
    .where(eq(productVariants.isActive, true))
    .limit(1);

  variantId = variant!.id;
  variantPublicId = variant!.publicId;
});

beforeEach(async () => {
  await db.delete(couponRedemptions);
  await db.delete(orderItems);
  // Before orders: payments is the one child with ON DELETE RESTRICT, so a single
  // leftover row wedges every run of this suite against a shared database.
  await db.delete(payments);
  await db.delete(orders);
  await db.delete(coupons);
  await setStock(100);
});

afterAll(async () => {
  await db.delete(couponRedemptions);
  await db.delete(orderItems);
  await db.delete(payments);
  await db.delete(orders);
  await db.delete(coupons);
  await db.delete(addresses).where(eq(addresses.userId, userId));
  await db.delete(addresses).where(eq(addresses.userId, otherUserId));
  await db.delete(users).where(eq(users.id, userId));
  await db.delete(users).where(eq(users.id, otherUserId));
  await setStock(100);
  await pool.end();
});

describe('createOrder', () => {
  it('creates an order and takes the stock in one transaction', async () => {
    const order = await createOrder({
      userId,
      lines: [{ variantPublicId, quantity: 2 }],
      shippingAddressPublicId: addressPublicId,
    });

    expect(order.orderNumber).toMatch(/^MM\d{6}[0-9A-Z]{6}$/);
    expect(order.grandTotalPaise).toBeGreaterThan(0);

    const [variant] = await db
      .select({ stock: productVariants.stockQuantity })
      .from(productVariants)
      .where(eq(productVariants.id, variantId));
    expect(variant!.stock).toBe(98);
  });

  it('snapshots the line so later catalogue edits cannot rewrite history', async () => {
    const order = await createOrder({
      userId,
      lines: [{ variantPublicId, quantity: 1 }],
      shippingAddressPublicId: addressPublicId,
    });

    const [item] = await db
      .select({
        productName: orderItems.productName,
        unitPricePaise: orderItems.unitPricePaise,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.orderId));

    const originalPrice = item!.unitPricePaise;
    const originalName = item!.productName;

    // The catalogue changes after the sale.
    await db
      .update(productVariants)
      .set({ pricePaise: originalPrice + 500_000 })
      .where(eq(productVariants.id, variantId));

    const [after] = await db
      .select({
        productName: orderItems.productName,
        unitPricePaise: orderItems.unitPricePaise,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.orderId));

    expect(after!.unitPricePaise).toBe(originalPrice);
    expect(after!.productName).toBe(originalName);
  });

  it('refuses an address belonging to somebody else', async () => {
    // The IDOR case: a valid address id, but not the caller's.
    await expect(
      createOrder({
        userId,
        lines: [{ variantPublicId, quantity: 1 }],
        shippingAddressPublicId: foreignAddressPublicId,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('refuses an empty cart', async () => {
    await expect(
      createOrder({ userId, lines: [], shippingAddressPublicId: addressPublicId }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('refuses to order more than the stock on hand', async () => {
    await setStock(3);

    await expect(
      createOrder({
        userId,
        lines: [{ variantPublicId, quantity: 5 }],
        shippingAddressPublicId: addressPublicId,
      }),
    ).rejects.toMatchObject({ code: 'PRICE_CHANGED' });

    const [variant] = await db
      .select({ stock: productVariants.stockQuantity })
      .from(productVariants)
      .where(eq(productVariants.id, variantId));
    // A rejected order must not have consumed anything.
    expect(variant!.stock).toBe(3);
  });

  it('never oversells under concurrent checkouts', async () => {
    await setStock(5);

    // Ten simultaneous orders for one unit each against five in stock.
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        createOrder({
          userId,
          lines: [{ variantPublicId, quantity: 1 }],
          shippingAddressPublicId: addressPublicId,
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const [variant] = await db
      .select({ stock: productVariants.stockQuantity })
      .from(productVariants)
      .where(eq(productVariants.id, variantId));

    expect(succeeded).toBeLessThanOrEqual(5);
    expect(variant!.stock).toBe(5 - succeeded);
    // Stock can never go negative, whatever the interleaving.
    expect(variant!.stock).toBeGreaterThanOrEqual(0);

    const placed = await db.select({ id: orders.id }).from(orders);
    expect(placed).toHaveLength(succeeded);
  });
});

describe('coupons at checkout', () => {
  async function createCoupon(over: Partial<typeof coupons.$inferInsert> = {}) {
    const [row] = await db.insert(coupons).values({
      publicId: newPublicId(),
      code: 'TESTCOUPON',
      kind: 'percent',
      value: 1000,
      minOrderPaise: 0,
      perUserLimit: 1,
      isActive: true,
      ...over,
    });
    return row.insertId;
  }

  it('applies a valid coupon and records the redemption', async () => {
    await createCoupon();

    const order = await createOrder({
      userId,
      lines: [{ variantPublicId, quantity: 1 }],
      shippingAddressPublicId: addressPublicId,
      couponCode: 'testcoupon',
    });

    const [saved] = await db
      .select({ discountPaise: orders.discountPaise, couponCode: orders.couponCode })
      .from(orders)
      .where(eq(orders.id, order.orderId));

    expect(saved!.discountPaise).toBeGreaterThan(0);
    // Codes are stored and compared case-insensitively.
    expect(saved!.couponCode).toBe('TESTCOUPON');

    const redemptions = await db.select({ id: couponRedemptions.id }).from(couponRedemptions);
    expect(redemptions).toHaveLength(1);
  });

  it('rejects an unknown or inactive coupon', async () => {
    await expect(
      createOrder({
        userId,
        lines: [{ variantPublicId, quantity: 1 }],
        shippingAddressPublicId: addressPublicId,
        couponCode: 'NOPE',
      }),
    ).rejects.toMatchObject({ code: 'COUPON_INVALID' });

    await createCoupon({ code: 'OFF', isActive: false });
    await expect(
      createOrder({
        userId,
        lines: [{ variantPublicId, quantity: 1 }],
        shippingAddressPublicId: addressPublicId,
        couponCode: 'OFF',
      }),
    ).rejects.toMatchObject({ code: 'COUPON_INVALID' });
  });

  it('rejects an expired coupon', async () => {
    await createCoupon({ endsAt: new Date(Date.now() - 60_000) });

    await expect(
      createOrder({
        userId,
        lines: [{ variantPublicId, quantity: 1 }],
        shippingAddressPublicId: addressPublicId,
        couponCode: 'TESTCOUPON',
      }),
    ).rejects.toMatchObject({ code: 'COUPON_EXPIRED' });
  });

  it('enforces the per-user limit on a second use', async () => {
    await createCoupon({ perUserLimit: 1 });

    await createOrder({
      userId,
      lines: [{ variantPublicId, quantity: 1 }],
      shippingAddressPublicId: addressPublicId,
      couponCode: 'TESTCOUPON',
    });

    await expect(
      createOrder({
        userId,
        lines: [{ variantPublicId, quantity: 1 }],
        shippingAddressPublicId: addressPublicId,
        couponCode: 'TESTCOUPON',
      }),
    ).rejects.toMatchObject({ code: 'COUPON_ALREADY_USED' });
  });

  it('enforces a minimum order value', async () => {
    await createCoupon({ minOrderPaise: 99_999_999 });

    await expect(
      createOrder({
        userId,
        lines: [{ variantPublicId, quantity: 1 }],
        shippingAddressPublicId: addressPublicId,
        couponCode: 'TESTCOUPON',
      }),
    ).rejects.toMatchObject({ code: 'COUPON_NOT_APPLICABLE' });
  });

  it('never exceeds a global usage limit, even under concurrency', async () => {
    await createCoupon({ usageLimit: 3, perUserLimit: 10 });

    await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        createOrder({
          userId,
          lines: [{ variantPublicId, quantity: 1 }],
          shippingAddressPublicId: addressPublicId,
          couponCode: 'TESTCOUPON',
        }),
      ),
    );

    const [row] = await db
      .select({ usageCount: coupons.usageCount })
      .from(coupons)
      .where(eq(coupons.code, 'TESTCOUPON'));

    expect(row!.usageCount).toBeLessThanOrEqual(3);

    const discounted = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(couponRedemptions);
    expect(Number(discounted[0]!.total)).toBeLessThanOrEqual(3);
  });
});

describe('cancelUnpaidOrder', () => {
  it('returns the stock it had taken', async () => {
    await setStock(10);

    const order = await createOrder({
      userId,
      lines: [{ variantPublicId, quantity: 3 }],
      shippingAddressPublicId: addressPublicId,
    });

    const cancelled = await cancelUnpaidOrder(order.orderId, 'test');
    expect(cancelled).toBe(true);

    const [variant] = await db
      .select({ stock: productVariants.stockQuantity })
      .from(productVariants)
      .where(eq(productVariants.id, variantId));
    expect(variant!.stock).toBe(10);
  });

  it('is idempotent — a second cancellation returns no stock twice', async () => {
    await setStock(10);

    const order = await createOrder({
      userId,
      lines: [{ variantPublicId, quantity: 3 }],
      shippingAddressPublicId: addressPublicId,
    });

    expect(await cancelUnpaidOrder(order.orderId, 'first')).toBe(true);
    expect(await cancelUnpaidOrder(order.orderId, 'second')).toBe(false);

    const [variant] = await db
      .select({ stock: productVariants.stockQuantity })
      .from(productVariants)
      .where(eq(productVariants.id, variantId));
    expect(variant!.stock).toBe(10);
  });
});
