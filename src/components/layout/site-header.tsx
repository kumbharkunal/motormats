import Link from 'next/link';

import { AccountMenu } from '@/components/layout/account-menu';
import { CartButton } from '@/components/layout/cart-button';
import { HeaderBand } from '@/components/layout/header-band';
import { MobileNav } from '@/components/layout/mobile-nav';
import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { NAV_LINKS } from '@/components/layout/nav-links';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/current-user';
import { isAdminRole } from '@/lib/auth/rbac';

/**
 * The header, on the page's own terms: one ink band, hairline rules, no pills.
 *
 * The nav used to float in a rounded capsule with its own translucent ground.
 * That was the right object on a page of rounded cards and it is the wrong one
 * here — the layout is now built from square plates and 1px lines, and a
 * floating capsule was the only radius left above the fold.
 *
 * Three tracks on desktop: brand, nav, actions. The nav is centred by the grid
 * rather than absolutely positioned, so a long label can no longer slide it
 * under the logo.
 */
export async function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const user = await getCurrentUser().catch(() => null);
  const isAdmin = user ? isAdminRole(user.role) : false;

  return (
    <HeaderBand overlay={overlay}>
      <div className="mx-auto grid h-12 max-w-(--container-page) grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center gap-3">
          <MobileNav isSignedIn={Boolean(user)} isAdmin={isAdmin} userName={user?.name ?? null} />
          <Link href="/" aria-label="Motormats home" className="hidden lg:flex">
            <MotormatsLogo size="md" tone="brand" priority className="h-8" />
          </Link>
        </div>

        <Link href="/" aria-label="Motormats home" className="justify-self-center lg:hidden">
          <MotormatsLogo size="sm" tone="brand" priority className="h-7" />
        </Link>

        <nav aria-label="Primary" className="hidden justify-self-center lg:block">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group relative block py-2 text-sm text-white/65 transition-colors duration-300 hover:text-white"
                >
                  {link.label}
                  {/* Square, and a hairline rather than a gradient bar. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-motion duration-300 ease-out group-hover:scale-x-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-2 md:gap-4">
          <CartButton />
          {user ? (
            <AccountMenu name={user.name} isAdmin={isAdmin} />
          ) : (
            <Link
              href="/sign-in"
              className="caps hidden text-eyebrow text-white/65 transition-colors duration-300 hover:text-white sm:block"
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
