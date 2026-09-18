import Link from 'next/link';

import { cn } from '@/lib/utils';

/**
 * The tertiary action: tracked caps over a hairline rule, with an arrow that
 * steps right on hover.
 *
 * Used where a band needs a way out but a button would compete with the
 * headline — "explore all", "learn more". The rule is a border on the link
 * itself rather than an underline so it spans the full width of the label
 * including the arrow, and so it can thicken on hover.
 */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex min-h-11 items-center gap-3 border-b border-current/30 pb-2',
        'caps text-label text-foreground transition-colors duration-300',
        'hover:border-current/80',
        className,
      )}
    >
      {children}
      <span aria-hidden className="transition-motion duration-300 group-hover:translate-x-1">
        &rarr;
      </span>
    </Link>
  );
}
