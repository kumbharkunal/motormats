import type { Metadata } from 'next';

import { AnnouncementMarquee } from '@/components/layout/announcement-marquee';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { listFeaturedProducts, type FeaturedProduct } from '@/features/catalog/server/queries';
import { ClosingBand } from '@/features/home/components/closing-band';
import { FindYourFitPanel } from '@/features/home/components/find-your-fit-panel';
import { HeroPanel } from '@/features/home/components/hero-panel';
import { InstagramReelsSection } from '@/features/home/components/instagram-reels-section';
import { InTheWildSection } from '@/features/home/components/in-the-wild-section';
import { MatsComparisonPanel } from '@/features/home/components/mats-comparison-panel';
import { ProcessSection } from '@/features/home/components/process-section';
import { RangeGrid } from '@/features/home/components/range-grid';
import { SurfacesSection } from '@/features/home/components/surfaces-section';
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
 * rather than serving the bands that need no data at all. The catch only ever
 * covered the *failure* case; this covers the hang.
 */
async function featuredWithinBudget(): Promise<FeaturedProduct[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      listFeaturedProducts(8),
      new Promise<FeaturedProduct[]>((resolve) => {
        timer = setTimeout(() => {
          logger.warn(
            { budgetMs: CATALOGUE_BUDGET_MS },
            'featured products timed out, rendering without them',
          );
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
 * **Nine bands, from seventeen.** The page used to run cover, fit, comparison,
 * surfaces, a collections rail, a materials table, process, cover story, photo
 * essay, interior spread, real conditions, editorial discover, gallery, a
 * product zone, reels, assurance and a closing call to action. Eight of those
 * were the same editorial shape with different photographs in it, and three
 * more made the same argument about fit in three registers — so the page was
 * long without being full, which is what a reader feels as "busy".
 *
 * What is left alternates paper and ink, with the ink used sparingly and on
 * purpose: the cover opens dark, the photography band breaks the middle, and
 * the close lands dark again. Everything between them is paper. No copy was
 * written for this — every line on the page was already on it.
 *
 * The reels sit directly after the range rather than near the close: the clips
 * are of the product being fitted, so they answer the question the cards have
 * just raised, and they carry that momentum into the comparison.
 *
 * Note what is *not* here: `section-defer`. That utility sets
 * `content-visibility: auto`, which keeps a section's layout out of the render
 * tree until it is near the viewport — and a section with no layout has no
 * measurable height, so every ScrollTrigger below it resolved its start and end
 * against the wrong scroll position. The photography is lazy-loaded through the
 * image elements instead, which is where the weight actually was.
 */
export default async function HomePage() {
  const featured = await featuredWithinBudget();

  return (
    <div className="flex min-h-svh flex-col">
      <AnnouncementMarquee />
      <SiteHeader />

      <main id="main" className="flex-1">
        <HeroPanel />
        <FindYourFitPanel />
        <RangeGrid products={featured.slice(0, 4)} />
        <InstagramReelsSection />
        <MatsComparisonPanel />
        <SurfacesSection />
        <InTheWildSection />
        <ProcessSection />
        <ClosingBand />
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </div>
  );
}
