import { PackageSearch } from 'lucide-react';
import Link from 'next/link';

import { Pagination } from '@/features/catalog/components/pagination';
import { ProductCard } from '@/features/catalog/components/product-card';
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
          <ul className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4 md:gap-6">
            {result.items.map((product, index) => (
              <li key={product.publicId}>
                <ProductCard product={product} priority={index < 4} />
              </li>
            ))}
          </ul>

          <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  );
}

/** Shown when the catalogue itself cannot be reached, as opposed to being empty. */
export function ListingUnavailable() {
  return (
    <div className="border-border mt-8 flex flex-col items-center rounded-3xl border border-dashed px-6 py-20 text-center">
      <PackageSearch aria-hidden className="text-subtle-foreground size-10" strokeWidth={1.2} />
      <h2 className="text-h3 mt-5">We can&apos;t load the catalogue right now</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm text-balance">
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
    <div className="border-border mt-8 flex flex-col items-center rounded-3xl border border-dashed px-6 py-20 text-center">
      <PackageSearch aria-hidden className="text-subtle-foreground size-10" strokeWidth={1.2} />
      <h2 className="text-h3 mt-5">Nothing matches that yet</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm text-balance">
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
