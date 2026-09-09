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

/** Every track scrolls rather than wraps, so each row stays exactly one chip tall. */
const SCROLLER =
  'flex snap-x snap-mandatory gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/**
 * Server-rendered filters: every control is a link that changes the URL, so the
 * listing needs no client JavaScript, works with the back button, and is
 * shareable and crawlable.
 *
 * Two single-height tracks rather than a wrapping block. The previous layout
 * let the five sort labels wrap to three or four rows on a phone, which left
 * the "Sort" caption vertically centred against a stack instead of aligned with
 * the chips, and put 44px pills on the same baseline as 20px text.
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
    <div className="flex flex-col gap-3 border-b border-border pb-5">
      <nav aria-label="Categories">
        {/* -mx-1/px-1 so a focus ring on the first chip is not clipped by the
            scroll container. */}
        <ul className={cn(SCROLLER, '-mx-1 px-1 py-1')}>
          <li className="snap-start">
            <Chip href={categoryHref()} active={!state.categorySlug}>
              All
            </Chip>
          </li>
          {categories.map((category) => (
            <li key={category.slug} className="snap-start">
              <Chip
                href={categoryHref(category.slug)}
                active={state.categorySlug === category.slug}
              >
                {category.name}
              </Chip>
            </li>
          ))}
        </ul>
      </nav>

      {/* One track: count, then everything else pushed right by the spacer.
          Narrow screens scroll it instead of wrapping, so the row is always a
          single 44px line and the caption sits on the chips' centre line. */}
      <div className={cn(SCROLLER, '-mx-1 items-center px-1 py-1')}>
        <p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'product' : 'products'}
        </p>

        <span aria-hidden className="min-w-4 flex-1" />

        <Chip href={href({ inStockOnly: !state.inStockOnly })} active={state.inStockOnly}>
          In stock only
        </Chip>

        <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border" />

        <span className="shrink-0 text-xs tracking-wide text-muted-foreground uppercase">Sort</span>

        <ul className="flex shrink-0 items-center gap-2">
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
      // A fixed h-11 rather than min-h-11: with a minimum, a long label could
      // grow one chip taller than its neighbours in the same row.
      className={cn(
        'inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-xs font-medium whitespace-nowrap transition-colors duration-200',
        active
          ? 'border-accent bg-accent text-white'
          : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}
