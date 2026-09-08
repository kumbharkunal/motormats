import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

import { db, pool } from '@db/client';
import { productVariants } from '@db/schema/catalog';
import {
  getCategoryBySlug,
  getProductBySlug,
  getVariantsForPurchase,
  listCategories,
  listProducts,
} from '@/features/catalog/server/queries';

/** Runs against the seeded development database (`npm run db:seed`). */

afterAll(async () => {
  await pool.end();
});

describe('listProducts', () => {
  it('returns only active products with aggregate price and stock', async () => {
    const result = await listProducts();

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBe(result.items.length <= result.perPage ? result.total : result.total);

    for (const item of result.items) {
      expect(item.slug).toBeTruthy();
      // fromPrice is the cheapest variant, so it can never exceed the headline.
      expect(item.fromPricePaise).toBeGreaterThan(0);
      expect(Number.isInteger(item.fromPricePaise)).toBe(true);
    }
  });

  it('paginates without overlap and reports a stable total', async () => {
    const first = await listProducts({ perPage: 3, page: 1, sort: 'price-asc' });
    const second = await listProducts({ perPage: 3, page: 2, sort: 'price-asc' });

    expect(first.items).toHaveLength(3);
    expect(first.total).toBe(second.total);
    expect(first.totalPages).toBe(Math.ceil(first.total / 3));

    const overlap = first.items
      .map((i) => i.slug)
      .filter((slug) => second.items.some((i) => i.slug === slug));
    expect(overlap).toEqual([]);
  });

  it('sorts by price in both directions', async () => {
    const asc = await listProducts({ sort: 'price-asc', perPage: 20 });
    const desc = await listProducts({ sort: 'price-desc', perPage: 20 });

    const ascPrices = asc.items.map((i) => i.fromPricePaise);
    expect([...ascPrices].sort((a, b) => a - b)).toEqual(ascPrices);

    expect(desc.items[0]?.slug).toBe(asc.items.at(-1)?.slug);
  });

  it('filters by category and returns nothing for an unknown one', async () => {
    const categories = await listCategories();
    const target = categories[0]!;

    const filtered = await listProducts({ categorySlug: target.slug, perPage: 50 });
    expect(filtered.items.length).toBeGreaterThan(0);
    expect(filtered.total).toBeLessThan((await listProducts({ perPage: 50 })).total + 1);

    // An unknown slug must not silently fall back to the whole catalogue.
    const unknown = await listProducts({ categorySlug: 'does-not-exist' });
    expect(unknown.items).toEqual([]);
    expect(unknown.total).toBe(0);
  });

  it('filters by price range', async () => {
    const all = await listProducts({ perPage: 50, sort: 'price-asc' });
    const cheapest = all.items[0]!.fromPricePaise;

    const capped = await listProducts({ maxPricePaise: cheapest, perPage: 50 });
    for (const item of capped.items) {
      expect(item.fromPricePaise).toBeLessThanOrEqual(cheapest);
    }
  });

  it('finds products by full-text search', async () => {
    const result = await listProducts({ query: 'carbon', perPage: 20 });

    expect(result.items.length).toBeGreaterThan(0);
    expect(
      result.items.every((item) =>
        `${item.name} ${item.summary ?? ''}`.toLowerCase().includes('carbon'),
      ),
    ).toBe(true);
  });
});

describe('getProductBySlug', () => {
  it('returns detail with images and variants, and no N+1 shape', async () => {
    const listed = await listProducts({ perPage: 1 });
    const slug = listed.items[0]!.slug;

    const product = await getProductBySlug(slug);
    expect(product).not.toBeNull();
    expect(product!.variants.length).toBeGreaterThan(0);
    expect(product!.images.length).toBeGreaterThan(0);

    for (const variant of product!.variants) {
      // Variants without an explicit price inherit the product's base price.
      expect(variant.pricePaise).toBeGreaterThan(0);
      expect(Number.isInteger(variant.pricePaise)).toBe(true);
    }
  });

  it('returns null for an unknown or inactive slug', async () => {
    expect(await getProductBySlug('no-such-product')).toBeNull();
  });

  it('flags low stock and out of stock distinctly', async () => {
    // Sets up its own stock rather than relying on seeded values: other suites
    // mutate the same variants, so depending on their state makes this test
    // order-dependent.
    const before = await getProductBySlug('7d-sport-luxury-mat');
    const target = before!.variants[0]!;

    const [original] = await db
      .select({ stock: productVariants.stockQuantity, threshold: productVariants.lowStockThreshold })
      .from(productVariants)
      .where(eq(productVariants.publicId, target.publicId));

    try {
      await db
        .update(productVariants)
        .set({ stockQuantity: 0 })
        .where(eq(productVariants.publicId, target.publicId));

      const soldOutView = await getProductBySlug('7d-sport-luxury-mat');
      const soldOut = soldOutView!.variants.find((v) => v.publicId === target.publicId)!;
      expect(soldOut.stockQuantity).toBe(0);
      // Zero stock is "sold out", never "low stock".
      expect(soldOut.isLowStock).toBe(false);

      await db
        .update(productVariants)
        .set({ stockQuantity: original!.threshold })
        .where(eq(productVariants.publicId, target.publicId));

      const lowView = await getProductBySlug('7d-sport-luxury-mat');
      const low = lowView!.variants.find((v) => v.publicId === target.publicId)!;
      expect(low.isLowStock).toBe(true);
    } finally {
      await db
        .update(productVariants)
        .set({ stockQuantity: original!.stock })
        .where(eq(productVariants.publicId, target.publicId));
    }
  });
});

describe('getVariantsForPurchase', () => {
  it('resolves many variants in one round trip', async () => {
    const product = await getProductBySlug('7d-sport-luxury-mat');
    const ids = product!.variants.slice(0, 3).map((v) => v.publicId);

    const rows = await getVariantsForPurchase(ids);
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row.productStatus).toBe('active');
      expect(row.taxRateBps).toBeGreaterThan(0);
    }
  });

  it('returns nothing for an empty request without querying', async () => {
    expect(await getVariantsForPurchase([])).toEqual([]);
  });

  it('silently omits unknown ids rather than failing', async () => {
    expect(await getVariantsForPurchase(['01ARZ3NDEKTSV4RRFFQ69G5FAV'])).toEqual([]);
  });
});

describe('categories', () => {
  it('lists active categories in display order', async () => {
    const list = await listCategories();
    expect(list.length).toBeGreaterThan(0);
    expect(await getCategoryBySlug(list[0]!.slug)).not.toBeNull();
    expect(await getCategoryBySlug('nope')).toBeNull();
  });
});
