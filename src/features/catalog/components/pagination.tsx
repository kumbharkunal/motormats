import Link from 'next/link';

import { cn } from '@/lib/utils';

/**
 * Page-number pagination, rendered as plain links so it works without
 * JavaScript and each page is independently crawlable.
 *
 * On narrow screens the window of numbers shrinks rather than wrapping into a
 * second row.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const numbers = pageWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <PageLink href={buildHref(page - 1)} disabled={page === 1} rel="prev">
        <span aria-hidden>‹</span>
        <span className="sr-only">Previous page</span>
      </PageLink>

      <ul className="flex items-center gap-1">
        {numbers.map((entry, index) =>
          entry === 'gap' ? (
            <li
              key={`gap-${index}`}
              aria-hidden
              className="px-1 text-sm text-subtle-foreground select-none"
            >
              …
            </li>
          ) : (
            <li key={entry} className={cn(Math.abs(entry - page) > 1 && 'hidden sm:block')}>
              <PageLink href={buildHref(entry)} current={entry === page}>
                {entry}
              </PageLink>
            </li>
          ),
        )}
      </ul>

      <PageLink href={buildHref(page + 1)} disabled={page === totalPages} rel="next">
        <span aria-hidden>›</span>
        <span className="sr-only">Next page</span>
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  current = false,
  disabled = false,
  rel,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
  rel?: string;
}) {
  const classes = cn(
    'inline-flex size-11 items-center justify-center rounded-full border text-sm transition-colors duration-200',
    current
      ? 'border-accent bg-accent font-semibold text-white'
      : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
    disabled && 'pointer-events-none opacity-40',
  );

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} rel={rel} aria-current={current ? 'page' : undefined} className={classes}>
      {children}
    </Link>
  );
}

/** First, last, and a window around the current page, with gaps collapsed. */
function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  const output: (number | 'gap')[] = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) output.push('gap');
    output.push(value);
    previous = value;
  }
  return output;
}
