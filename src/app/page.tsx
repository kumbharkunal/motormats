import type { Metadata } from 'next';

import { AnnouncementMarquee } from '@/components/layout/announcement-marquee';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { listFeaturedProducts, type FeaturedProduct } from '@/features/catalog/server/queries';
import { AssurancePanel } from '@/features/home/components/assurance-panel';
import { CollectionsRail } from '@/features/home/components/collections-rail';
import { CraftsmanshipPanel } from '@/features/home/components/craftsmanship-panel';
import { HeroPanel } from '@/features/home/components/hero-panel';
import { ProductZone } from '@/features/home/components/product-zone';
import { VehicleBrandRail } from '@/features/vehicles/components/vehicle-brand-rail';
import { clientEnv } from '@/lib/env.client';
import { logger } from '@/lib/logger';

/** The featured rows read the catalogue, so it is published by revalidation. */
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

/*
 * The homepage builds its own shell rather than joining the `(shop)` group,
 * because it is the one route whose header floats over the content: the hero is
 * pulled up under the header so the footage reaches the top of the viewport,
 * which needs the header band left unpainted.
 */
export default async function HomePage() {
  // One query for both zones rather than one per section. Eight is the most the
  // two 2x2 grids can show; a shorter catalogue fills the first zone and the
  // second is dropped rather than repeating the same products.
  let featured: FeaturedProduct[] = [];
  try {
    featured = await listFeaturedProducts(8);
  } catch (error) {
    logger.error({ err: error }, 'featured products unavailable on the homepage');
  }

  const zoneA = featured.slice(0, 4);
  const zoneB = featured.slice(4, 8);

  return (
    <div className="flex min-h-svh flex-col">
      <AnnouncementMarquee />
      <SiteHeader overlay />

      <main id="main" className="flex-1">
        <HeroPanel />
        <VehicleBrandRail />
        <CollectionsRail />
        <ProductZone
          id="zone-fit"
          eyebrow="Cut to your floorpan"
          title="Made to fit"
          body="Every pattern starts from a 3D scan of the actual car. No size brackets, no trimming, no gap at the pedals."
          image="motormats/zones/made-to-fit"
          imageAlt="A custom-cut car mat sitting flush against a car's floorpan"
          ctaHref="/collections"
          ctaLabel="Shop all mats"
          products={zoneA}
        />
        <CraftsmanshipPanel />
        {zoneB.length > 0 ? (
          <ProductZone
            id="zone-weather"
            eyebrow="Built for the monsoon"
            title="All weather"
            body="Channelled trays that hold what the road brings in. Lift out, rinse down, refit — no drying time."
            image="motormats/zones/all-weather"
            imageAlt="A channelled all-weather car mat holding rainwater in its tray"
            ctaHref="/collections/all-weather"
            ctaLabel="Shop all-weather"
            products={zoneB}
            reverse
          />
        ) : null}
        <AssurancePanel />
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        // Serialised from a literal we control; no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </div>
  );
}
