import Link from 'next/link';

import { AccountMenu } from '@/components/layout/account-menu';
import { CartButton } from '@/components/layout/cart-button';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { NAV_LINKS } from '@/components/layout/nav-links';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/current-user';
import { isAdminRole } from '@/lib/auth/rbac';
import { cn } from '@/lib/utils';

export async function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const user = await getCurrentUser().catch(() => null);
  const isAdmin = user ? isAdminRole(user.role) : false;

  return (
    <header
      className={cn(
        'z-40 w-full shrink-0 px-4 pt-4 md:px-6 md:pt-5',
        overlay ? 'pointer-events-none absolute inset-x-0 top-0' : 'sticky top-0',
      )}
    >
      <div
        className={cn(
          'relative mx-auto flex h-12 items-center justify-between gap-4',
          'max-w-(--container-page)',
          overlay && '*:pointer-events-auto',
        )}
      >
        <div className="flex items-center gap-3">
          <MobileNav isSignedIn={Boolean(user)} isAdmin={isAdmin} />
          <Link href="/" aria-label="Motormats home" className="hidden lg:flex">
            <MotormatsLogo size="md" priority className="h-11" />
          </Link>
        </div>

        <Link
          href="/"
          aria-label="Motormats home"
          className="absolute left-1/2 -translate-x-1/2 lg:hidden"
        >
          <MotormatsLogo size="sm" priority className="h-9" />
        </Link>

        <nav
          aria-label="Primary"
          className="nav-pill absolute left-1/2 hidden h-12 -translate-x-1/2 items-center rounded-full px-7 lg:flex"
        >
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-foreground/70 hover:text-foreground group relative block py-2 text-sm tracking-[0.04em] transition-colors duration-300"
                >
                  {link.label}
                  <span
                    aria-hidden
                    className="from-accent to-accent/50 absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r transition-transform duration-300 ease-out group-hover:scale-x-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <CartButton />
          {user ? (
            <AccountMenu name={user.name} isAdmin={isAdmin} />
          ) : (
            <Button asChild size="sm" className="hidden h-12 px-6 sm:inline-flex">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
