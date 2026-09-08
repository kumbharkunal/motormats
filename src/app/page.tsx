import type { Metadata } from 'next';

import { DeckPanel } from '@/components/deck/deck-panel';
import { ScrollDeck } from '@/components/deck/scroll-deck';
import { AnnouncementMarquee } from '@/components/layout/announcement-marquee';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { CraftsmanshipPanel } from '@/features/home/components/craftsmanship-panel';
import { HeroPanel } from '@/features/home/components/hero-panel';
import { ProductsPanel } from '@/features/home/components/products-panel';
import { clientEnv } from '@/lib/env.client';

/** The featured row reads the catalogue, so it is published by revalidation. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Premium Custom-Fit Car Mats',
  description:
    'Precision-cut car mats engineered for an exact fit. All-weather protection, anti-skid backing, free shipping and a 1 year warranty.',
  alternates: { canonical: '/' },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Motormats',
  url: clientEnv.NEXT_PUBLIC_APP_URL,
  logo: `${clientEnv.NEXT_PUBLIC_APP_URL}/brand/logo.webp`,
  description: 'Premium custom-fit car mats, precision-cut for an exact vehicle fit.',
};

export default function HomePage() {
  return (
    <>
      <ScrollDeck
        banner={<AnnouncementMarquee />}
        // Two variants rather than one configurable node: the header is a
        // Server Component, so it cannot read the deck's client-side mode.
        headerOverlay={<SiteHeader overlay />}
        headerSticky={<SiteHeader />}
      >
        <HeroPanel />
        <CraftsmanshipPanel />
        <ProductsPanel />
        {/* The footer sizes itself to fit a panel, so this stays a plain panel.
            An inner scroll here would need `swiper-no-mousewheel`, and that class
            makes Swiper drop every wheel event on the panel — including the one
            that scrolls back up, trapping the visitor on the last panel. */}
        <DeckPanel>
          <SiteFooter />
        </DeckPanel>
      </ScrollDeck>

      <script
        type="application/ld+json"
        // Serialised from a literal we control; no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
