import Link from 'next/link';

import { AccountMenu } from '@/components/layout/account-menu';
import { CartButton } from '@/components/layout/cart-button';
import { HeaderBand } from '@/components/layout/header-band';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { NavLinks } from '@/components/layout/nav-links-list';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/current-user';
import { isAdminRole } from '@/lib/auth/rbac';

/**
 * The header, on the page's own terms: one ink band, hairline rules, no pills.
 *
 * Three tracks on desktop: brand, nav, actions. The nav is centred by the grid
 * rather than absolutely positioned, so a long label can no longer slide it
 * under the logo.
 *
 * The band is ink at every scroll position, which is what lets the supplied
 * lockup — "MOTOR" set in white — be used exactly as delivered, with nothing
 * behind it.
 */
export async function SiteHeader() {
  const user = await getCurrentUser().catch(() => null);
  const isAdmin = user ? isAdminRole(user.role) : false;

  return (
    <HeaderBand>
      <div className="mx-auto grid h-11 max-w-(--container-page) grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center gap-3">
          <MobileNav isSignedIn={Boolean(user)} isAdmin={isAdmin} userName={user?.name ?? null} />
          <Link href="/" aria-label="Motormats home" className="hidden lg:flex">
            <MotormatsLogo size="md" priority />
          </Link>
        </div>

        <Link href="/" aria-label="Motormats home" className="justify-self-center lg:hidden">
          <MotormatsLogo size="sm" priority />
        </Link>

        <NavLinks />

        <div className="flex items-center justify-end gap-2 md:gap-4">
          <CartButton />
          {user ? (
            <AccountMenu name={user.name} isAdmin={isAdmin} />
          ) : (
            <Link
              href="/sign-in"
              className="caps hidden text-eyebrow text-muted-foreground transition-colors duration-300 hover:text-foreground sm:block"
            >
              Sign in
            </Link>
          )}
          <Button
            asChild
            variant="flat"
            size="caps"
            shape="square"
            className="hidden h-11 px-6 lg:inline-flex"
          >
            <Link href={SHOP_ROUTES.findYourFit}>Find your fit</Link>
          </Button>
        </div>
      </div>
    </HeaderBand>
  );
}
