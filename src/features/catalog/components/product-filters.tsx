import Link from 'next/link';

import type { ProductSort } from '@/features/catalog/server/queries';
import { cn } from '@/lib/utils';

const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
];

export type FilterState = {
  categorySlug?: string | undefined;
  sort: ProductSort;
  inStockOnly: boolean;
  query?: string | undefined;
};

/**
 * Server-rendered filters: every control is a link that changes the URL, so the
 * listing needs no client JavaScript, works with the back button, and is
 * shareable and crawlable.
 */
export function ProductFilters({
  categories,
  state,
  basePath,
  resultCount,
}: {
  categories: { slug: string; name: string }[];
  state: FilterState;
  basePath: string;
  resultCount: number;
}) {
  const href = (overrides: Partial<FilterState & { page: number }>) => {
    const params = new URLSearchParams();
    const next = { ...state, ...overrides };

    if (next.sort && next.sort !== 'featured') params.set('sort', next.sort);
    if (next.inStockOnly) params.set('inStock', '1');
    if (next.query) params.set('q', next.query);
    // Any filter change returns to page one; keeping the old page can land on
    // an empty result set.
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const categoryHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (state.sort !== 'featured') params.set('sort', state.sort);
    if (state.inStockOnly) params.set('inStock', '1');
    if (state.query) params.set('q', state.query);
    const query = params.toString();
    const path = slug ? `/collections/${slug}` : '/collections';
    return query ? `${path}?${query}` : path;
  };

  return (
    <div className="border-border flex flex-col gap-5 border-b pb-6">
      <nav aria-label="Categories">
        <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li>
            <Chip href={categoryHref()} active={!state.categorySlug}>
              All
            </Chip>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <Chip href={categoryHref(category.slug)} active={state.categorySlug === category.slug}>
                {category.name}
              </Chip>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'product' : 'products'}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Chip href={href({ inStockOnly: !state.inStockOnly })} active={state.inStockOnly}>
            In stock only
          </Chip>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs tracking-wide uppercase">Sort</span>
            <ul className="flex flex-wrap gap-2">
              {SORTS.map((option) => (
                <li key={option.value}>
                  <Chip href={href({ sort: option.value })} active={state.sort === option.value}>
                    {option.label}
                  </Chip>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'inline-flex min-h-11 items-center rounded-full border px-4 text-xs font-medium whitespace-nowrap transition-colors duration-200',
        active
          ? 'border-accent bg-accent text-white'
          : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}
