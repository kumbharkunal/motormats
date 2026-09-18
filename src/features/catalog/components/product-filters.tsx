import { Check, X } from 'lucide-react';
import Link from 'next/link';

import type { ProductSort } from '@/features/catalog/server/queries';
import { VEHICLE_BRANDS } from '@/features/vehicles/data/brands';
import { cn } from '@/lib/utils';

const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
];

export type FilterState = {
  categorySlug?: string | undefined;
  sort: ProductSort;
  inStockOnly: boolean;
  query?: string | undefined;
  brand?: string | undefined;
  model?: string | undefined;
  year?: string | undefined;
  fitConfirmed?: boolean;
};

/**
 * Server-rendered filters: every control is a link that changes the URL, so the
 * listing needs no client JavaScript, works with the back button, and is
 * shareable and crawlable.
 *
 * **Nothing scrolls sideways any more.** The previous version put the categories
 * on one horizontal scroller and the sort options on another, which meant that
 * on a phone most of the sort options — including, often, the selected one —
 * were off-screen behind a scrollbar that was itself hidden. A filter you cannot
 * see is a filter that does not exist. Both rows wrap now, so every option is on
 * screen at every width and the page is taller by one line at worst.
 *
 * Categories read as tabs with an underline rather than as filled pills: they
 * are navigation between collections, and they have their own routes.
 * Everything else is a small tracked label, because a screen of identical pills
 * gives no clue which of them is the primary choice.
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
    if (next.brand) params.set('brand', next.brand);
    if (next.model) params.set('model', next.model);
    if (next.year) params.set('year', next.year);
    if (next.fitConfirmed) params.set('fit', '1');
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
    if (state.brand) params.set('brand', state.brand);
    if (state.model) params.set('model', state.model);
    if (state.year) params.set('year', state.year);
    if (state.fitConfirmed) params.set('fit', '1');
    const query = params.toString();
    const path = slug ? `/collections/${slug}` : '/collections';
    return query ? `${path}?${query}` : path;
  };

  // Resolve display names from the static brand data.
  const activeBrand = state.brand ? VEHICLE_BRANDS.find((b) => b.slug === state.brand) : undefined;
  const activeModel =
    activeBrand && state.model ? activeBrand.models.find((m) => m.slug === state.model) : undefined;

  const dropVehicle = (keepBrand: boolean) => {
    const params = new URLSearchParams();
    if (state.sort !== 'featured') params.set('sort', state.sort);
    if (state.inStockOnly) params.set('inStock', '1');
    if (state.query) params.set('q', state.query);
    if (keepBrand && state.brand) params.set('brand', state.brand);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className="border-b border-border">
      <nav aria-label="Collections">
        {/* Tighter gutters below `md`: at 360px the four range names plus "All"
            need two rows either way, and 28px of gap was pushing "All-Weather"
            onto a third. The touch target is the row height, not the gap. */}
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-0 md:gap-x-7">
          <li>
            <Tab href={categoryHref()} active={!state.categorySlug}>
              All
            </Tab>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <Tab href={categoryHref(category.slug)} active={state.categorySlug === category.slug}>
                {category.name}
              </Tab>
            </li>
          ))}
        </ul>
      </nav>

      {/* The vehicle a reader arrived with, and the way back out of it. */}
      {activeBrand ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border py-3">
          <span className="caps mr-1 text-eyebrow text-subtle-foreground">Fitted to</span>
          <RemovableChip href={dropVehicle(false)} label={activeBrand.name} />
          {activeModel ? <RemovableChip href={dropVehicle(true)} label={activeModel.name} /> : null}
          {state.year ? (
            <span className="caps border border-border px-3 py-2 text-eyebrow text-muted-foreground">
              {state.year}
            </span>
          ) : null}
          {state.fitConfirmed ? (
            <span className="caps bg-ink px-3 py-2 text-eyebrow text-white">Exact fit</span>
          ) : null}
        </div>
      ) : null}

      {/*
        Three stacked blocks became two rows on a phone.

        This bar was taking about 250px before a single product appeared: a line
        for the count, a line for the stock toggle, a line for the word "Sort"
        and then two more for the options it labelled. The count and the toggle
        share a row now — they are both one short phrase — and the "Sort" label
        goes visually silent below `md`, where it was costing a whole 44px row to
        name five options that already read as sort options. It stays in the
        accessibility tree either way, so the list keeps its name.

        Nothing is hidden behind a disclosure and nothing scrolls sideways. An
        earlier version put these on horizontal scrollers and the selected option
        was routinely off-screen behind a hidden scrollbar, which is worse than
        tall.
      */}
      <div className="flex items-center justify-between gap-x-8 gap-y-3 border-t border-border py-1 md:py-3">
        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'product' : 'products'}
        </p>
        <StockToggle href={href({ inStockOnly: !state.inStockOnly })} on={state.inStockOnly} />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-0 border-t border-border py-1 md:py-3">
        <span id="sort-label" className="caps sr-only text-eyebrow text-subtle-foreground md:not-sr-only">
          Sort
        </span>
        <ul aria-labelledby="sort-label" className="flex flex-wrap items-center gap-x-5 gap-y-0">
          {SORTS.map((option) => (
            <li key={option.value}>
              <Tab href={href({ sort: option.value })} active={state.sort === option.value}>
                {option.label}
              </Tab>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * The one control shape on this bar.
 *
 * `aria-current` rather than colour alone marks the selection, and the underline
 * carries it visually — so it survives a greyscale screenshot and a screen
 * reader alike. The 44px floor comes from the padding, not from a border, so a
 * row of these still reads as type rather than as a toolbar.
 */
function Tab({
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
        'group relative inline-flex min-h-11 items-center text-sm whitespace-nowrap transition-colors duration-200',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 bottom-2 h-px origin-left bg-accent transition-motion duration-300 ease-out',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
      />
    </Link>
  );
}

/**
 * A link that reads as a checkbox.
 *
 * It cannot be one — the whole bar is server-rendered links so the listing needs
 * no JavaScript — and `aria-pressed` is not valid on an anchor. The accessible
 * name carries the state and the action instead, which is what a screen reader
 * needs in order to know what following it will do.
 */
function StockToggle({ href, on }: { href: string; on: boolean }) {
  return (
    <Link
      href={href}
      aria-label={on ? 'Remove the in-stock filter' : 'Show in-stock products only'}
      className="group inline-flex min-h-11 items-center gap-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
    >
      <span
        aria-hidden
        className={cn(
          'grid size-4 shrink-0 place-items-center border transition-colors duration-200',
          on
            ? 'border-accent bg-accent text-white'
            : 'border-border-strong group-hover:border-foreground',
        )}
      >
        {on ? <Check size={11} strokeWidth={3} /> : null}
      </span>
      <span className={cn(on && 'text-foreground')}>In stock only</span>
    </Link>
  );
}

/** An applied vehicle filter, with the way to drop it. */
function RemovableChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={`Remove the ${label} filter`}
      className="caps inline-flex min-h-11 shrink-0 items-center gap-2 border border-border px-3 text-eyebrow text-foreground transition-colors duration-200 hover:border-accent hover:text-accent-text"
    >
      {label}
      <X aria-hidden size={13} strokeWidth={2} className="shrink-0" />
    </Link>
  );
}
