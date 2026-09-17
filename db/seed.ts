import { config as loadEnv } from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { ulid } from 'ulid';

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

type SeedVariant = {
  sku: string;
  name: string;
  options: Record<string, string>;
  pricePaise?: number;
  stockQuantity: number;
};

type SeedProduct = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  brand: string;
  basePricePaise: number;
  compareAtPricePaise?: number;
  isFeatured?: boolean;
  imageBase: string;
  variants: SeedVariant[];
};

/**
 * The three shots every product carries, derived from one base id.
 *
 * They are uploaded to Cloudinary under `motormats/products/<base>` with the
 * `-fitted` and `-detail` suffixes, so the set is a convention rather than three
 * strings repeated per product — and a missing suffix shows up as one broken
 * thumbnail instead of a silently absent gallery.
 *
 * `width`/`height` are deliberately left null: the sources are a mix of 1254 and
 * 1600 square, nothing lays out from them (the gallery and cards use `fill`),
 * and the old hardcoded 600x600 was simply wrong.
 */
function buildImages(base: string, name: string) {
  return [
    {
      assetId: `/products/${base}.webp`,
      alt: `A set of ${name} car mats laid flat on a white background`,
    },
  ];
}

const FITS = [
  { key: 'Hatchback', delta: 0, stock: 40 },
  { key: 'Sedan', delta: 40_000, stock: 32 },
  { key: 'SUV', delta: 90_000, stock: 18 },
] as const;

function buildVariants(
  skuPrefix: string,
  basePricePaise: number,
  colours: readonly string[],
): SeedVariant[] {
  const variants: SeedVariant[] = [];
  for (const fit of FITS) {
    for (const colour of colours) {
      variants.push({
        sku: `${skuPrefix}-${fit.key.slice(0, 3).toUpperCase()}-${colour.slice(0, 3).toUpperCase()}`,
        name: `${fit.key} · ${colour}`,
        options: { fit: fit.key, colour },
        pricePaise: basePricePaise + fit.delta,
        // Deliberately varied so low-stock and out-of-stock states are reachable.
        stockQuantity: colour === 'Red' ? 0 : fit.stock,
      });
    }
  }
  return variants;
}

const CATALOG: { category: { slug: string; name: string; description: string }; items: SeedProduct[] }[] = [
  {
    category: {
      slug: '7d-luxury',
      name: '7D Luxury',
      description: 'Deep-dish moulded mats with raised edges that contain every spill.',
    },
    items: [
      {
        slug: '7d-sport-luxury-mat',
        name: '7D Sport Luxury Mat',
        summary: 'Deep-dish performance fit with a raised containment lip.',
        description:
          'Laser-scanned to your vehicle floorpan and moulded in a single piece, the 7D Sport holds spills, grit and monsoon water inside a raised lip rather than letting them reach the carpet underneath. A dual-density base keeps the mat flat under hard cornering.',
        brand: 'Motormats',
        basePricePaise: 449_900,
        compareAtPricePaise: 599_900,
        isFeatured: true,
        imageBase: '1',
        variants: buildVariants('7DS', 449_900, ['Black', 'Tan', 'Red']),
      },
    ],
  },
  {
    category: {
      slug: 'carbon',
      name: 'Carbon Series',
      description: 'Carbon-weave surface with a technical, low-gloss finish.',
    },
    items: [
      {
        slug: 'carbon-series-mat',
        name: 'Carbon Series Mat',
        summary: 'Carbon-weave surface over a dual-density anti-skid base.',
        description:
          'A woven carbon-effect topsheet bonded to a closed-cell base. The surface sheds dust rather than trapping it, so a wipe restores the finish without shampooing.',
        brand: 'Motormats',
        basePricePaise: 529_900,
        compareAtPricePaise: 649_900,
        isFeatured: true,
        imageBase: '2',
        variants: buildVariants('CBS', 529_900, ['Black', 'Graphite']),
      },
    ],
  },
  {
    category: {
      slug: 'carpet',
      name: 'Executive Carpet',
      description: 'Plush tufted carpet with a rubberised anti-skid backing.',
    },
    items: [
      {
        slug: 'executive-carpet-mat',
        name: 'Executive Carpet Mat',
        summary: 'Plush tufted finish with a rubberised anti-skid backing.',
        description:
          'A 1,200 GSM tufted pile bonded to a moulded rubber backing. Warmer underfoot than a moulded mat, with heel-pad reinforcement where wear actually happens.',
        brand: 'Motormats',
        basePricePaise: 389_900,
        isFeatured: true,
        imageBase: '3',
        variants: buildVariants('EXC', 389_900, ['Charcoal', 'Beige']),
      },
    ],
  },
  {
    category: {
      slug: 'all-weather',
      name: 'All-Weather',
      description: 'Monsoon-ready containment mats that wash clean in seconds.',
    },
    items: [
      {
        slug: 'all-weather-mat',
        name: 'All-Weather Mat',
        summary: 'Monsoon-ready containment that rinses clean in seconds.',
        description:
          'A deep channelled tray that holds well over a litre of water per mat. Lift it out, rinse it down and refit — no drying time, no residue in the carpet.',
        brand: 'Motormats',
        basePricePaise: 299_900,
        compareAtPricePaise: 379_900,
        isFeatured: true,
        imageBase: '4',
        variants: buildVariants('AWM', 299_900, ['Black', 'Grey']),
      },
    ],
  },
];

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
