import 'server-only';

import { and, asc, desc, eq, gte, inArray, lte, sql, type SQL } from 'drizzle-orm';

import { db } from '@db/client';
import { categories, productImages, products, productVariants } from '@db/schema/catalog';

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

export type ProductListFilters = {
  categorySlug?: string | undefined;
  minPricePaise?: number | undefined;
  maxPricePaise?: number | undefined;
  inStockOnly?: boolean | undefined;
  query?: string | undefined;
  sort?: ProductSort | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
};

export type ProductListItem = {
  publicId: string;
  slug: string;
  name: string;
  summary: string | null;
  fromPricePaise: number;
  compareAtPricePaise: number | null;
  imageAssetId: string | null;
  imageAlt: string | null;
  inStock: boolean;
  ratingAverage: number | null;
  ratingCount: number;
  /** Cheapest in-stock variant, for quick-add from a card. Null when sold out. */
  defaultVariantPublicId: string | null;
};

export type ProductListResult = {
  items: ProductListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/**
 * Cheapest in-stock variant per product, in a single round trip.
 *
 * Both listings need it to offer quick-add, and doing it per row would be an
 * N+1 across a full page of cards.
 */
async function cheapestInStockVariants(productPublicIds: string[]): Promise<Map<string, string>> {
  const cheapest = new Map<string, string>();
  if (productPublicIds.length === 0) return cheapest;

  const variantRows = await db
    .select({
      productPublicId: products.publicId,
      publicId: productVariants.publicId,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(
      and(
        inArray(products.publicId, productPublicIds),
        eq(productVariants.isActive, true),
        gte(productVariants.stockQuantity, 1),
      ),
    )
    .orderBy(asc(productVariants.pricePaise), asc(productVariants.id));

  for (const variant of variantRows) {
    if (!cheapest.has(variant.productPublicId)) {
      cheapest.set(variant.productPublicId, variant.publicId);
    }
  }

  return cheapest;
}

const DEFAULT_PER_PAGE = 12;
const MAX_PER_PAGE = 48;

export async function listProducts(filters: ProductListFilters = {}): Promise<ProductListResult> {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Math.trunc(filters.perPage ?? DEFAULT_PER_PAGE)),
  );

  const conditions: SQL[] = [eq(products.status, 'active')];

  if (filters.categorySlug) {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.slug, filters.categorySlug), eq(categories.isActive, true)))
      .limit(1);

    if (!category) return emptyResult(page, perPage);
    conditions.push(eq(products.categoryId, category.id));
  }

  if (filters.minPricePaise !== undefined) {
    conditions.push(gte(products.basePricePaise, filters.minPricePaise));
  }
  if (filters.maxPricePaise !== undefined) {
    conditions.push(lte(products.basePricePaise, filters.maxPricePaise));
  }

  if (filters.query) {
    conditions.push(
      sql`MATCH(${products.name}, ${products.summary}, ${products.description}) AGAINST (${filters.query} IN NATURAL LANGUAGE MODE)`,
    );
  }

  const where = and(...conditions);

  const fromPrice = sql<number>`MIN(COALESCE(${productVariants.pricePaise}, ${products.basePricePaise}))`;
  const stockTotal = sql<number>`COALESCE(SUM(${productVariants.stockQuantity}), 0)`;

  const having = filters.inStockOnly ? sql`${stockTotal} > 0` : undefined;

  const rows = await db
    .select({
      publicId: products.publicId,
      slug: products.slug,
      name: products.name,
      summary: products.summary,
      basePricePaise: products.basePricePaise,
      compareAtPricePaise: products.compareAtPricePaise,
      createdAt: products.createdAt,
      isFeatured: products.isFeatured,
      ratingSum: products.ratingSum,
      ratingCount: products.ratingCount,
      imageAssetId: productImages.assetId,
      imageAlt: productImages.alt,
      fromPrice,
      stockTotal,
    })
    .from(products)
    .leftJoin(
      productVariants,
      and(eq(productVariants.productId, products.id), eq(productVariants.isActive, true)),
    )
    .leftJoin(
      productImages,
      and(eq(productImages.productId, products.id), eq(productImages.position, 0)),
    )
    .where(where)
    .groupBy(products.id, productImages.assetId, productImages.alt)
    .having(having ?? sql`1 = 1`)
    .orderBy(...orderFor(filters.sort ?? 'featured'))
    .limit(perPage)
    .offset((page - 1) * perPage);

  const [counted] = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${products.id})` })
    .from(products)
    .leftJoin(
      productVariants,
      and(eq(productVariants.productId, products.id), eq(productVariants.isActive, true)),
    )
    .where(where);

  const total = Number(counted?.total ?? 0);

  const cheapestVariant = await cheapestInStockVariants(rows.map((row) => row.publicId));

  return {
    items: rows.map((row) => ({
      publicId: row.publicId,
      slug: row.slug,
      name: row.name,
      summary: row.summary,
      fromPricePaise: Number(row.fromPrice ?? row.basePricePaise),
      compareAtPricePaise: row.compareAtPricePaise,
      imageAssetId: row.imageAssetId,
      imageAlt: row.imageAlt,
      inStock: Number(row.stockTotal ?? 0) > 0,
      ratingAverage: row.ratingCount > 0 ? row.ratingSum / row.ratingCount : null,
      ratingCount: row.ratingCount,
      defaultVariantPublicId: cheapestVariant.get(row.publicId) ?? null,
    })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

function orderFor(sort: ProductSort) {
  switch (sort) {
    case 'price-asc':
      return [asc(products.basePricePaise), asc(products.id)];
    case 'price-desc':
      return [desc(products.basePricePaise), asc(products.id)];
    case 'newest':
      return [desc(products.createdAt), asc(products.id)];
    case 'rating':
      return [
        desc(sql`${products.ratingSum} / NULLIF(${products.ratingCount}, 0)`),
        asc(products.id),
      ];
    case 'featured':
    default:
      return [desc(products.isFeatured), asc(products.id)];
  }
}

function emptyResult(page: number, perPage: number): ProductListResult {
  return { items: [], total: 0, page, perPage, totalPages: 1 };
}

export type FeaturedProduct = {
  publicId: string;
  slug: string;
  name: string;
  categoryName: string | null;
  fromPricePaise: number;
  imageAssetId: string | null;
  imageAlt: string | null;
  ratingAverage: number | null;
  ratingCount: number;
  defaultVariantPublicId: string | null;
};

export async function listFeaturedProducts(limit = 4): Promise<FeaturedProduct[]> {
  const fromPrice = sql<number>`MIN(COALESCE(${productVariants.pricePaise}, ${products.basePricePaise}))`;

  const rows = await db
    .select({
      publicId: products.publicId,
      slug: products.slug,
      name: products.name,
      basePricePaise: products.basePricePaise,
      ratingSum: products.ratingSum,
      ratingCount: products.ratingCount,
      categoryName: categories.name,
      imageAssetId: productImages.assetId,
      imageAlt: productImages.alt,
      fromPrice,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(
      productVariants,
      and(eq(productVariants.productId, products.id), eq(productVariants.isActive, true)),
    )
    .leftJoin(
      productImages,
      and(eq(productImages.productId, products.id), eq(productImages.position, 0)),
    )
    .where(eq(products.status, 'active'))
    .groupBy(products.id, categories.name, productImages.assetId, productImages.alt)
    .orderBy(desc(products.isFeatured), asc(products.id))
    .limit(limit);

  if (rows.length === 0) return [];

  const cheapestVariant = await cheapestInStockVariants(rows.map((row) => row.publicId));

  return rows.map((row) => ({
    publicId: row.publicId,
    slug: row.slug,
    name: row.name,
    categoryName: row.categoryName,
    fromPricePaise: Number(row.fromPrice ?? row.basePricePaise),
    imageAssetId: row.imageAssetId,
    imageAlt: row.imageAlt,
    ratingAverage: row.ratingCount > 0 ? row.ratingSum / row.ratingCount : null,
    ratingCount: row.ratingCount,
    defaultVariantPublicId: cheapestVariant.get(row.publicId) ?? null,
  }));
}

export type ProductDetail = {
  id: number;
  publicId: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  brand: string | null;
  basePricePaise: number;
  compareAtPricePaise: number | null;
  taxRateBps: number;
  ratingAverage: number | null;
  ratingCount: number;
  category: { slug: string; name: string } | null;
  images: { assetId: string; alt: string; width: number | null; height: number | null }[];
  variants: {
    publicId: string;
    sku: string;
    name: string;
    options: Record<string, string> | null;
    pricePaise: number;
    stockQuantity: number;
    isLowStock: boolean;
  }[];
};

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const [row] = await db
    .select({
      id: products.id,
      publicId: products.publicId,
      slug: products.slug,
      name: products.name,
      summary: products.summary,
      description: products.description,
      brand: products.brand,
      basePricePaise: products.basePricePaise,
      compareAtPricePaise: products.compareAtPricePaise,
      taxRateBps: products.taxRateBps,
      ratingSum: products.ratingSum,
      ratingCount: products.ratingCount,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(products.slug, slug), eq(products.status, 'active')))
    .limit(1);

  if (!row) return null;

  const [images, variants] = await Promise.all([
    db
      .select({
        assetId: productImages.assetId,
        alt: productImages.alt,
        width: productImages.width,
        height: productImages.height,
      })
      .from(productImages)
      .where(eq(productImages.productId, row.id))
      .orderBy(asc(productImages.position)),
    db
      .select({
        publicId: productVariants.publicId,
        sku: productVariants.sku,
        name: productVariants.name,
        options: productVariants.options,
        pricePaise: productVariants.pricePaise,
        stockQuantity: productVariants.stockQuantity,
        lowStockThreshold: productVariants.lowStockThreshold,
      })
      .from(productVariants)
      .where(and(eq(productVariants.productId, row.id), eq(productVariants.isActive, true)))
      .orderBy(asc(productVariants.position)),
  ]);

  return {
    id: row.id,
    publicId: row.publicId,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    brand: row.brand,
    basePricePaise: row.basePricePaise,
    compareAtPricePaise: row.compareAtPricePaise,
    taxRateBps: row.taxRateBps,
    ratingAverage: row.ratingCount > 0 ? row.ratingSum / row.ratingCount : null,
    ratingCount: row.ratingCount,
    category: row.categorySlug ? { slug: row.categorySlug, name: row.categoryName ?? '' } : null,
    images,
    variants: variants.map((variant) => ({
      publicId: variant.publicId,
      sku: variant.sku,
      name: variant.name,
      options: variant.options,
      pricePaise: variant.pricePaise ?? row.basePricePaise,
      stockQuantity: variant.stockQuantity,
      isLowStock: variant.stockQuantity > 0 && variant.stockQuantity <= variant.lowStockThreshold,
    })),
  };
}

export async function listCategories() {
  return db
    .select({
      publicId: categories.publicId,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.position), asc(categories.id));
}

export async function getCategoryBySlug(slug: string) {
  const [row] = await db
    .select({ slug: categories.slug, name: categories.name, description: categories.description })
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
    .limit(1);
  return row ?? null;
}

export async function listActiveProductSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return db
    .select({ slug: products.slug, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.status, 'active'))
    .orderBy(asc(products.id));
}

export async function getVariantsForPurchase(variantPublicIds: string[]) {
  if (variantPublicIds.length === 0) return [];

  return db
    .select({
      variantId: productVariants.id,
      variantPublicId: productVariants.publicId,
      variantName: productVariants.name,
      sku: productVariants.sku,
      stockQuantity: productVariants.stockQuantity,
      isActive: productVariants.isActive,
      variantPricePaise: productVariants.pricePaise,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      productStatus: products.status,
      basePricePaise: products.basePricePaise,
      taxRateBps: products.taxRateBps,
      imageAssetId: productImages.assetId,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(
      productImages,
      and(eq(productImages.productId, products.id), eq(productImages.position, 0)),
    )
    .where(inArray(productVariants.publicId, variantPublicIds));
}
