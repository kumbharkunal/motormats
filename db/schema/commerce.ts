import {
  boolean,
  char,
  index,
  int,
  json,
  mysqlTable,
  smallint,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import { dateTime, foreignId, paise, primaryId, publicId, timestamps } from './columns.ts';
import { productVariants } from './catalog.ts';
import { users } from './identity.ts';

export const ADDRESS_TYPES = ['shipping', 'billing'] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export const addresses = mysqlTable(
  'addresses',
  {
    id: primaryId().primaryKey(),
    publicId: publicId().notNull(),
    userId: foreignId()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: varchar({ length: 16 }).$type<AddressType>().notNull().default('shipping'),
    fullName: varchar({ length: 120 }).notNull(),
    phone: varchar({ length: 20 }).notNull(),
    line1: varchar({ length: 200 }).notNull(),
    line2: varchar({ length: 200 }),
    city: varchar({ length: 80 }).notNull(),
    state: varchar({ length: 80 }).notNull(),
    postalCode: varchar({ length: 12 }).notNull(),
    countryCode: char({ length: 2 }).notNull().default('IN'),

    isDefault: boolean().notNull().default(false),
    // Soft-deleted: never hard-delete an address that may be on an existing order.
    archivedAt: dateTime(),

    ...timestamps(),
  },
  (t) => [
    uniqueIndex('addresses_public_id_uq').on(t.publicId),
    index('addresses_user_idx').on(t.userId, t.archivedAt),
  ],
);

export const COUPON_KINDS = ['percent', 'fixed'] as const;
export type CouponKind = (typeof COUPON_KINDS)[number];

export const coupons = mysqlTable(
  'coupons',
  {
    id: primaryId().primaryKey(),
    publicId: publicId().notNull(),
    code: varchar({ length: 32 }).notNull(),
    description: varchar({ length: 200 }),

    kind: varchar({ length: 16 }).$type<CouponKind>().notNull(),
    value: int().notNull(),
    maxDiscountPaise: paise(),
    minOrderPaise: paise().notNull().default(0),

    startsAt: dateTime(),
    endsAt: dateTime(),

    usageLimit: int(),
    usageCount: int().notNull().default(0),
    perUserLimit: int().notNull().default(1),

    isActive: boolean().notNull().default(true),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('coupons_code_uq').on(t.code),
    uniqueIndex('coupons_public_id_uq').on(t.publicId),
    index('coupons_active_window_idx').on(t.isActive, t.startsAt, t.endsAt),
  ],
);

export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = mysqlTable(
  'orders',
  {
    id: primaryId().primaryKey(),
    publicId: publicId().notNull(),
    orderNumber: varchar({ length: 24 }).notNull(),

    userId: foreignId()
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),

    status: varchar({ length: 24 }).$type<OrderStatus>().notNull().default('pending_payment'),

    // Address snapshot — not a FK; must survive the customer editing or deleting the address.
    shippingAddress: json().$type<Record<string, string | null>>().notNull(),
    billingAddress: json().$type<Record<string, string | null>>(),

    subtotalPaise: paise().notNull(),
    discountPaise: paise().notNull().default(0),
    shippingPaise: paise().notNull().default(0),
    taxPaise: paise().notNull().default(0),
    grandTotalPaise: paise().notNull(),

    couponCode: varchar({ length: 32 }),
    customerNote: varchar({ length: 500 }),

    placedAt: dateTime(),
    cancelledAt: dateTime(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('orders_public_id_uq').on(t.publicId),
    uniqueIndex('orders_order_number_uq').on(t.orderNumber),
    index('orders_user_created_idx').on(t.userId, t.createdAt),
    index('orders_status_created_idx').on(t.status, t.createdAt),
  ],
);

export const orderItems = mysqlTable(
  'order_items',
  {
    id: primaryId().primaryKey(),
    orderId: foreignId()
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),

    /** Kept for reporting; nulled rather than blocking a variant's deletion. */
    variantId: foreignId().references(() => productVariants.id, { onDelete: 'set null' }),

    // --- Snapshot. Never re-read from the catalogue. ---
    productName: varchar({ length: 200 }).notNull(),
    variantName: varchar({ length: 160 }).notNull(),
    sku: varchar({ length: 64 }).notNull(),
    productSlug: varchar({ length: 160 }).notNull(),
    imageAssetId: varchar({ length: 255 }),
    unitPricePaise: paise().notNull(),
    quantity: int().notNull(),
    taxRateBps: int().notNull(),
    lineTotalPaise: paise().notNull(),
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
);

export const couponRedemptions = mysqlTable(
  'coupon_redemptions',
  {
    id: primaryId().primaryKey(),
    couponId: foreignId()
      .notNull()
      .references(() => coupons.id, { onDelete: 'restrict' }),
    userId: foreignId()
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    orderId: foreignId()
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    discountPaise: paise().notNull(),
    createdAt: timestamps().createdAt,
  },
  (t) => [
    uniqueIndex('redemption_coupon_order_uq').on(t.couponId, t.orderId),
    index('redemption_coupon_user_idx').on(t.couponId, t.userId),
  ],
);

export const PAYMENT_STATUSES = [
  'created',
  'authorized',
  'captured',
  'failed',
  'refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const payments = mysqlTable(
  'payments',
  {
    id: primaryId().primaryKey(),
    publicId: publicId().notNull(),
    orderId: foreignId()
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),

    provider: varchar({ length: 24 }).notNull().default('razorpay'),
    providerOrderId: varchar({ length: 64 }).notNull(),
    providerPaymentId: varchar({ length: 64 }),

    status: varchar({ length: 16 }).$type<PaymentStatus>().notNull().default('created'),
    amountPaise: paise().notNull(),
    currency: char({ length: 3 }).notNull().default('INR'),

    // True only after server-side HMAC verification — never set from a browser callback.
    signatureVerified: boolean().notNull().default(false),
    failureReason: varchar({ length: 200 }),

    capturedAt: dateTime(),
    refundedAt: dateTime(),
    refundedAmountPaise: paise().notNull().default(0),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('payments_public_id_uq').on(t.publicId),
    uniqueIndex('payments_provider_order_uq').on(t.provider, t.providerOrderId),
    index('payments_order_idx').on(t.orderId),
    index('payments_status_idx').on(t.status),
  ],
);

export const webhookEvents = mysqlTable(
  'webhook_events',
  {
    id: primaryId().primaryKey(),
    provider: varchar({ length: 24 }).notNull(),
    eventId: varchar({ length: 128 }).notNull(),
    eventType: varchar({ length: 64 }).notNull(),
    payloadHash: char({ length: 64 }).notNull(),
    processedAt: dateTime(),
    attempts: smallint().notNull().default(0),
    createdAt: timestamps().createdAt,
  },
  (t) => [
    uniqueIndex('webhook_provider_event_uq').on(t.provider, t.eventId),
    index('webhook_processed_idx').on(t.processedAt),
  ],
);

export type AddressRow = typeof addresses.$inferSelect;
export type CouponRow = typeof coupons.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
