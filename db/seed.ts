import { config as loadEnv } from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { ulid } from 'ulid';

import { buildImages, CATALOG } from './catalog-data.ts';
import { categories, productImages, products, productVariants } from './schema/catalog.ts';

loadEnv({ path: '.env.development', quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const rawCa = process.env.DATABASE_SSL_CA;
const ca =
  !rawCa || rawCa.includes('-----BEGIN')
    ? rawCa
    : Buffer.from(rawCa, 'base64').toString('utf8');

const connection = await mysql.createConnection({
  uri: url,
  ...(ca ? { ssl: { ca } } : {}),
});
const db = drizzle(connection, { casing: 'snake_case' });

async function seed() {
  console.log('Clearing catalog tables…');
  // Child-first so foreign keys stay satisfied without disabling checks.
  await db.delete(productImages);
  await db.delete(productVariants);
  await db.delete(products);
  await db.delete(categories);

  let productCount = 0;
  let variantCount = 0;

  for (const [index, group] of CATALOG.entries()) {
    const [category] = await db.insert(categories).values({
      publicId: ulid(),
      slug: group.category.slug,
      name: group.category.name,
      description: group.category.description,
      position: index,
      isActive: true,
    });

    for (const [itemIndex, item] of group.items.entries()) {
      const [inserted] = await db.insert(products).values({
        publicId: ulid(),
        slug: item.slug,
        name: item.name,
        summary: item.summary,
        description: item.description,
        categoryId: category.insertId,
        brand: item.brand,
        status: 'active',
        isFeatured: item.isFeatured ?? false,
        basePricePaise: item.basePricePaise,
        compareAtPricePaise: item.compareAtPricePaise ?? null,
        taxRateBps: 1800,
        ratingSum: 44 + itemIndex,
        ratingCount: 10,
      });
      productCount += 1;

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
      variantCount += item.variants.length;
    }
  }

  console.log(
    `Seeded ${CATALOG.length} categories, ${productCount} products, ${variantCount} variants.`,
  );
}

try {
  await seed();
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await connection.end();
}
