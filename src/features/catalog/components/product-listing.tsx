import { PackageSearch } from 'lucide-react';
import Link from 'next/link';

import { Pagination } from '@/features/catalog/components/pagination';
import { VirtualProductGrid } from '@/features/catalog/components/virtual-product-grid';
import { ProductFilters, type FilterState } from '@/features/catalog/components/product-filters';
import { listCategories, listProducts, type ProductSort } from '@/features/catalog/server/queries';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

const SORT_VALUES: ProductSort[] = ['featured', 'price-asc', 'price-desc', 'newest', 'rating'];

export type ListingSearchParams = {
  sort?: string;
  page?: string;
  inStock?: string;
  q?: string;
  brand?: string;
  model?: string;
  year?: string;
  fit?: string;
};

/** Normalises untrusted query strings into a filter state we can rely on. */
export function parseListingParams(params: ListingSearchParams): FilterState & { page: number } {
  const sort = SORT_VALUES.includes(params.sort as ProductSort)
    ? (params.sort as ProductSort)
    : 'featured';

  const parsedPage = Number.parseInt(params.page ?? '1', 10);

  return {
    sort,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    inStockOnly: params.inStock === '1',
    query: params.q?.trim() || undefined,
    brand: params.brand?.trim() || undefined,
    model: params.model?.trim() || undefined,
    year: params.year?.trim() || undefined,
    fitConfirmed: params.fit === '1',
  };
}

export async function ProductListing({
  categorySlug,
  basePath,
  searchParams,
}: {
  categorySlug?: string | undefined;
  basePath: string;
  searchParams: ListingSearchParams;
}) {
  const state = parseListingParams(searchParams);

  // An unreachable catalogue is an outage, not a broken route. Left to throw,
  // this took the whole page to the error boundary — a full-screen failure for
  // something the visitor can simply retry.
  let categories: Awaited<ReturnType<typeof listCategories>>;
  let result: Awaited<ReturnType<typeof listProducts>>;
  try {
    [categories, result] = await Promise.all([
      listCategories(),
      listProducts({
        categorySlug,
        sort: state.sort,
        page: state.page,
        inStockOnly: state.inStockOnly,
        query: state.query,
      }),
    ]);
  } catch (error) {
    logger.error({ err: error, categorySlug }, 'catalogue listing unavailable');
    return <ListingUnavailable />;
  }

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (state.sort !== 'featured') params.set('sort', state.sort);
    if (state.inStockOnly) params.set('inStock', '1');
    if (state.query) params.set('q', state.query);
    if (state.brand) params.set('brand', state.brand);
    if (state.model) params.set('model', state.model);
    if (state.year) params.set('year', state.year);
    if (state.fitConfirmed) params.set('fit', '1');
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className="mt-8">
      <ProductFilters
        categories={categories}
        state={{ ...state, categorySlug }}
        basePath={basePath}
        resultCount={result.total}
      />

      {result.items.length === 0 ? (
        <EmptyState hasFilters={state.inStockOnly || Boolean(state.query)} />
      ) : (
        <>
          <VirtualProductGrid products={result.items} />

          <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  );
}

/** Shown when the catalogue itself cannot be reached, as opposed to being empty. */
export function ListingUnavailable() {
  return (
    <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-20 text-center">
      <PackageSearch aria-hidden className="size-10 text-subtle-foreground" strokeWidth={1.2} />
      <h2 className="mt-5 text-h3">We can&apos;t load the catalogue right now</h2>
      <p className="mt-2 max-w-sm text-sm text-balance text-muted-foreground">
        This is on our side, not yours. Please refresh in a moment.
      </p>
      <Button asChild variant="ghost" className="mt-6">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-20 text-center">
      <PackageSearch aria-hidden className="size-10 text-subtle-foreground" strokeWidth={1.2} />
      <h2 className="mt-5 text-h3">Nothing matches that yet</h2>
      <p className="mt-2 max-w-sm text-sm text-balance text-muted-foreground">
        {hasFilters
          ? 'Try removing a filter or widening your search.'
          : 'This collection is being restocked. Check back shortly.'}
      </p>
      <Button asChild variant="ghost" className="mt-6">
        <Link href="/collections">View all products</Link>
      </Button>
    </div>
  );
}
