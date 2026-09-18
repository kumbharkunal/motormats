/**
 * Bring an existing catalogue up to the full ten mats, without clearing it.
 *
 * `db/seed.ts` is destructive by design — it deletes `product_images`,
 * `product_variants`, `products` and `categories` and rebuilds them, which is
 * right for a fresh environment and wrong for this project, where development
 * and production are the same MySQL instance. Running the seed to add six
 * products would take the other four offline, orphan every catalogue URL that
 * has been shared, and reissue public ids that existing links point at.
 *
 * So this only ever INSERTs. It reads the same `CATALOG` the seed does, skips
 * every product whose slug is already present, and creates a category only if
 * it is missing. Running it twice is a no-op.
 *
 * Run: node scripts/add-mat-products.ts
 *
 * To undo, delete by slug — the six it adds are:
 *   onyx-honeycomb-mat, cobalt-stripe-mat, ash-check-mat,
 *   silver-plush-mat, walnut-stripe-mat, crimson-stripe-mat
 */
import { config as loadEnv } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { ulid } from 'ulid';

import { buildImages, CATALOG } from '../db/catalog-data.ts';
import {
  categories,
  productImages,
  products,
  productVariants,
} from '../db/schema/catalog.ts';

const isProduction = process.env.NODE_ENV === 'production';
loadEnv({ path: isProduction ? '.env.production' : '.env.development', quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

// Mirrors the normalisation in src/lib/env.server.ts: the CA is accepted either
// as a PEM block or as the base64 of one.
const rawCa = process.env.DATABASE_SSL_CA;
const ca = !rawCa || rawCa.includes('-----BEGIN') ? rawCa : Buffer.from(rawCa, 'base64').toString('utf8');

const connection = await mysql.createConnection({ uri: url, ...(ca ? { ssl: { ca } } : {}) });
const db = drizzle(connection, { casing: 'snake_case' });

let added = 0;
let skipped = 0;

try {
  for (const [index, group] of CATALOG.entries()) {
    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, group.category.slug))
      .limit(1);

    let categoryId = existingCategory?.id;

    if (categoryId === undefined) {
      const [inserted] = await db.insert(categories).values({
        publicId: ulid(),
        slug: group.category.slug,
        name: group.category.name,
        description: group.category.description,
        position: index,
        isActive: true,
      });
      categoryId = inserted.insertId;
      console.log(`+ category  ${group.category.slug}`);
    }

    for (const [itemIndex, item] of group.items.entries()) {
      const [present] = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, item.slug))
        .limit(1);

      if (present) {
        skipped += 1;
        console.log(`· skipped   ${item.slug} (already in the catalogue)`);
        continue;
      }

      const [inserted] = await db.insert(products).values({
        publicId: ulid(),
        slug: item.slug,
        name: item.name,
        summary: item.summary,
        description: item.description,
        categoryId,
        brand: item.brand,
        status: 'active',
        isFeatured: item.isFeatured ?? false,
        basePricePaise: item.basePricePaise,
        compareAtPricePaise: item.compareAtPricePaise ?? null,
        taxRateBps: 1800,
        ratingSum: 44 + itemIndex,
        ratingCount: 10,
      });

      await db.insert(productImages).values(
        buildImages(item.imageBase, item.name).map((image, position) => ({
          productId: inserted.insertId,
          assetId: image.assetId,
          alt: image.alt,
          position,
        })),
      );

      await db.insert(productVariants).values(
        item.variants.map((variant, position) => ({
          publicId: ulid(),
          productId: inserted.insertId,
          sku: variant.sku,
          name: variant.name,
          options: variant.options,
          pricePaise: variant.pricePaise ?? null,
          stockQuantity: variant.stockQuantity,
          lowStockThreshold: 5,
          weightGrams: 2400,
          isActive: true,
          position,
        })),
      );

      added += 1;
      console.log(`+ product   ${item.slug} (${item.variants.length} variants)`);
    }
  }

  console.log(`\nAdded ${added} product${added === 1 ? '' : 's'}, skipped ${skipped} already present.`);
} catch (error) {
  console.error('Failed:', error);
  process.exitCode = 1;
} finally {
  await connection.end();
}
