import Link from 'next/link';

import { AccountMenu } from '@/components/layout/account-menu';
import { CartButton } from '@/components/layout/cart-button';
import { HeaderBand } from '@/components/layout/header-band';
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
    <HeaderBand overlay={overlay}>
      <div
        className={cn(
          // A grid below lg, so the logo sits in its own centre track and the
          // account pill can grow without ever reaching it. Above lg the logo
          // moves left and the nav pill takes the centre, absolutely.
          'relative mx-auto grid h-12 grid-cols-[1fr_auto_1fr] items-center gap-2',
          'lg:flex lg:justify-between lg:gap-4',
          'max-w-(--container-page)',
        )}
      >
        <div className="flex items-center gap-3">
          <MobileNav isSignedIn={Boolean(user)} isAdmin={isAdmin} userName={user?.name ?? null} />
          <Link href="/" aria-label="Motormats home" className="hidden lg:flex">
            <MotormatsLogo size="md" tone="auto" priority className="h-11" />
          </Link>
        </div>

        <Link href="/" aria-label="Motormats home" className="justify-self-center lg:hidden">
          <MotormatsLogo size="sm" tone="auto" priority className="h-9" />
        </Link>

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden h-12 -translate-x-1/2 items-center rounded-full nav-pill px-7 lg:flex"
        >
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group relative block py-2 text-sm tracking-[0.04em] text-foreground/70 transition-colors duration-300 group-data-[over-hero=true]/header:text-white/80 hover:text-foreground group-data-[over-hero=true]/header:hover:text-white"
                >
                  {link.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-accent to-accent/50 transition-motion duration-300 ease-out group-hover:scale-x-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-2 md:gap-3">
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
    </HeaderBand>
  );
}
