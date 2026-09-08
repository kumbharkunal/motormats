import type { ReactNode } from 'react';

import { AnnouncementMarquee } from '@/components/layout/announcement-marquee';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

/**
 * Storefront shell. Unlike the homepage deck these routes scroll normally —
 * the same split the reference site uses, where only the homepage is a deck.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <AnnouncementMarquee />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
