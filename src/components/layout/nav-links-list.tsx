'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_LINKS } from '@/components/layout/nav-links';
import { cn } from '@/lib/utils';

/**
 * The desktop nav.
 *
 * Client-side only because of `aria-current`: the bar had no indication of the
 * current route at all, in any form, which left a screen reader with six
 * identical links and no way to know where it already was. The drawer has
 * marked its active row all along.
 */
export function NavLinks() {
  const pathname = usePathname();

  // Two traps here. "/" prefix-matches every route, so it needs an exact
  // comparison; and "Find your fit" is "/#find-your-fit", an anchor into the
  // homepage rather than a route of its own — marking it aria-current would
  // claim the reader is on a page that does not exist.
  const isActive = (href: string) => {
    if (href.includes('#')) return false;
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  };

  return (
    <nav aria-label="Primary" className="hidden justify-self-center lg:block">
      <ul className="flex items-center gap-8">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative block py-2 text-sm transition-colors duration-300',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
                {/* Square, and a hairline rather than a gradient bar. The
                    current route holds it open; hover draws it. */}
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-motion duration-300 ease-out',
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
