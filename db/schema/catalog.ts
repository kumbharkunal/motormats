import type { AnyMySqlColumn } from 'drizzle-orm/mysql-core';
import {
  boolean,
  index,
  int,
  json,
  mysqlTable,
  smallint,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import { foreignId, paise, primaryId, publicId, timestamps } from './columns.ts';

export const PRODUCT_STATUSES = ['draft', 'active', 'archived'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const categories = mysqlTable(
  'categories',
  {
    id: primaryId().primaryKey(),
    publicId: publicId().notNull(),
    slug: varchar({ length: 120 }).notNull(),
    name: varchar({ length: 120 }).notNull(),
    description: text(),
    parentId: foreignId().references((): AnyMySqlColumn => categories.id, {
      onDelete: 'restrict',
    }),
    imagePublicId: varchar({ length: 255 }),
    position: int().notNull().default(0),
    isActive: boolean().notNull().default(true),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('categories_slug_uq').on(t.slug),
    uniqueIndex('categories_public_id_uq').on(t.publicId),
    index('categories_parent_idx').on(t.parentId),
    index('categories_active_position_idx').on(t.isActive, t.position),
  ],
);

export const products = mysqlTable(
  'products',
  {
    id: primaryId().primaryKey(),
    publicId: publicId().notNull(),
    slug: varchar({ length: 160 }).notNull(),
    name: varchar({ length: 200 }).notNull(),
    summary: varchar({ length: 320 }),
    description: text(),
    categoryId: foreignId().references(() => categories.id, { onDelete: 'restrict' }),
    brand: varchar({ length: 80 }),

    status: varchar({ length: 16 }).$type<ProductStatus>().notNull().default('draft'),
    isFeatured: boolean().notNull().default(false),

    basePricePaise: paise().notNull(),
    compareAtPricePaise: paise(),
    taxRateBps: int().notNull().default(1800),
    ratingSum: int().notNull().default(0),
    ratingCount: int().notNull().default(0),

    ...timestamps(),
  },
  (t) => [
    uniqueIndex('products_slug_uq').on(t.slug),
    uniqueIndex('products_public_id_uq').on(t.publicId),
    index('products_status_category_idx').on(t.status, t.categoryId),
    index('products_status_featured_idx').on(t.status, t.isFeatured),
    index('products_status_price_idx').on(t.status, t.basePricePaise),
  ],
);

export const productVariants = mysqlTable(
  'product_variants',
  {
    id: primaryId().primaryKey(),
    publicId: publicId().notNull(),
    productId: foreignId()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),

    sku: varchar({ length: 64 }).notNull(),
    name: varchar({ length: 160 }).notNull(),
    options: json().$type<Record<string, string>>(),

    pricePaise: paise(),

    // Decremented conditionally (`WHERE stock_quantity >= ?`) to prevent overselling.
    stockQuantity: int().notNull().default(0),
    lowStockThreshold: int().notNull().default(5),
    weightGrams: int(),

    isActive: boolean().notNull().default(true),
    position: smallint().notNull().default(0),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('variants_sku_uq').on(t.sku),
    uniqueIndex('variants_public_id_uq').on(t.publicId),
    index('variants_product_idx').on(t.productId, t.position),
    index('variants_stock_idx').on(t.isActive, t.stockQuantity),
  ],
);

export const productImages = mysqlTable(
  'product_images',
  {
    id: primaryId().primaryKey(),
    productId: foreignId()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantId: foreignId().references(() => productVariants.id, { onDelete: 'cascade' }),

    assetId: varchar({ length: 255 }).notNull(),
    alt: varchar({ length: 200 }).notNull(),
    width: int(),
    height: int(),
    position: smallint().notNull().default(0),
  },
  (t) => [
    index('images_product_position_idx').on(t.productId, t.position),
    index('images_variant_idx').on(t.variantId),
  ],
);

export type CategoryRow = typeof categories.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type ProductVariantRow = typeof productVariants.$inferSelect;
export type ProductImageRow = typeof productImages.$inferSelect;
