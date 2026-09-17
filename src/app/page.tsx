import type { Metadata } from 'next';

import { AnnouncementMarquee } from '@/components/layout/announcement-marquee';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { SHOP_ROUTES } from '@/features/catalog/routes';
// import { collectionPath } from '@/features/catalog/routes'; — only used by the commented-out All Weather zone below
import { listFeaturedProducts, type FeaturedProduct } from '@/features/catalog/server/queries';
import { AssurancePanel } from '@/features/home/components/assurance-panel';
import { ClosingCta } from '@/features/home/components/closing-cta';
import { CollectionsRail } from '@/features/home/components/collections-rail';
import { CoverStorySection } from '@/features/home/components/cover-story-section';
import { EditorialDiscoverSection } from '@/features/home/components/editorial-discover-section';
import { FindYourFitPanel } from '@/features/home/components/find-your-fit-panel';
import { HeroPanel } from '@/features/home/components/hero-panel';
import { HomeGalleryShowcase } from '@/features/home/components/home-gallery-showcase';
import { InstagramReelsSection } from '@/features/home/components/instagram-reels-section';
import { InteriorSpreadSection } from '@/features/home/components/interior-spread-section';
import { MaterialsComparisonTable } from '@/features/home/components/materials-comparison-table';
import { MatsComparisonPanel } from '@/features/home/components/mats-comparison-panel';
import { PhotoEssaySection } from '@/features/home/components/photo-essay-section';
import { ProcessSection } from '@/features/home/components/process-section';
import { ProductZone } from '@/features/home/components/product-zone';
import { RealConditionsSection } from '@/features/home/components/real-conditions-section';
import { SurfacesSection } from '@/features/home/components/surfaces-section';
// import { TestimonialSection } from '@/features/home/components/testimonial-section';
import { PHOTOS } from '@/features/home/photo-assets';
import { clientEnv } from '@/lib/env.client';
import { logger } from '@/lib/logger';

/** The product rows read the catalogue, so the page is published by revalidation. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Premium Custom-Fit Car Mats',
  description:
    'Woven custom-fit car mats, cut from a 3D scan of your exact floorpan. Four ranges, finished by hand at the edge.',
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

/** How long the catalogue gets before the page gives up and renders without it. */
const CATALOGUE_BUDGET_MS = 2500;

/**
 * The featured rows, but never at the cost of the page.
 *
 * `listFeaturedProducts` awaits a pooled connection, and a pool that cannot
 * reach the database does not reject — it queues. An unreachable database
 * therefore held the whole homepage open for two minutes and served nothing,
 * rather than serving the eleven bands that need no data at all. The catch only
 * ever covered the *failure* case; this covers the hang.
 */
async function featuredWithinBudget(): Promise<FeaturedProduct[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      listFeaturedProducts(8),
      new Promise<FeaturedProduct[]>((resolve) => {
        timer = setTimeout(() => {
          logger.warn({ budgetMs: CATALOGUE_BUDGET_MS }, 'featured products timed out, rendering without them');
          resolve([]);
        }, CATALOGUE_BUDGET_MS);
      }),
    ]);
  } catch (error) {
    logger.error({ err: error }, 'featured products unavailable on the homepage');
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The homepage.
 *
 * Structure: the ink and paper bands are the spine — cover, fit, comparison,
 * surfaces, process, conditions, testimonial, closing — and the magazine
 * sections sit between them, restyled onto the same type scale and the same two
 * grounds. Bands alternate so the page has a pulse on a fast scroll, and the
 * cover and the closing CTA are the same construction on purpose.
 *
 * Note what is *not* here: `section-defer`. That utility sets
 * `content-visibility: auto`, which keeps a section's layout out of the render
 * tree until it is near the viewport — and a section with no layout has no
 * measurable height, so every ScrollTrigger below it resolved its start and end
 * against the wrong scroll position. Pinning and parallax cannot coexist with
 * it. The photography is lazy-loaded through `next/image` instead, which is
 * where the weight actually was.
 */
export default async function HomePage() {
  const featured = await featuredWithinBudget();
  const zoneA = featured.slice(0, 4);
  // const zoneB = featured.slice(4, 8); — only used by the commented-out All Weather zone below

  return (
    <div className="flex min-h-svh flex-col">
      <AnnouncementMarquee />
      <SiteHeader overlay />

      <main id="main" className="flex-1">
        <HeroPanel />
        <FindYourFitPanel />
        <MatsComparisonPanel />

        <SurfacesSection />
        <CollectionsRail />
        <MaterialsComparisonTable />

        <ProcessSection />
        <CoverStorySection />
        <PhotoEssaySection />
        <InteriorSpreadSection />

        <RealConditionsSection />
        <EditorialDiscoverSection />
        <HomeGalleryShowcase products={featured} />

        <ProductZone
          id="zone-fit"
          eyebrow="Cut to your floorpan"
          title="Made to fit"
          body="Every pattern starts from a 3D scan of the actual car. No size brackets, no trimming, no gap at the pedals."
          image={PHOTOS.zones.madeToFit.src}
          imageAlt={PHOTOS.zones.madeToFit.alt}
          ctaHref={SHOP_ROUTES.collections}
          ctaLabel="Shop all mats"
          products={zoneA}
        />
        {/* Commented out for now — the All Weather zone. Re-enable by restoring this block. */}
        {/* {zoneB.length > 0 ? (
          <ProductZone
            id="zone-weather"
            eyebrow="Built for the monsoon"
            title="All weather"
            body="Channelled trays that hold what the road brings in. Lift out, rinse down, refit with no drying time."
            image={PHOTOS.zones.allWeather.src}
            imageAlt={PHOTOS.zones.allWeather.alt}
            ctaHref={collectionPath('all-weather')}
            ctaLabel="Shop all-weather"
            products={zoneB}
          />
        ) : null} */}

        <InstagramReelsSection />
        {/* <TestimonialSection /> — hidden for now */}
        <AssurancePanel />
        <ClosingCta />
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </div>
  );
}
