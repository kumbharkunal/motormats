import type { MetadataRoute } from 'next';

import { listActiveProductSlugs, listCategories } from '@/features/catalog/server/queries';
import { clientEnv } from '@/lib/env.client';
import { logger } from '@/lib/logger';

const BASE = clientEnv.NEXT_PUBLIC_APP_URL;

/**
 * Only genuinely indexable pages appear here. Cart, checkout, orders and
 * account pages are personal and are excluded — listing them would invite
 * crawls of URLs that always redirect.
 *
 * Regenerated hourly rather than at build time, so a newly published product is
 * discoverable without a redeploy.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    { url: BASE + '/collections', changeFrequency: 'daily', priority: 0.9 },
    { url: BASE + '/our-story', changeFrequency: 'monthly', priority: 0.5 },
    { url: BASE + '/gallery', changeFrequency: 'monthly', priority: 0.5 },
    { url: BASE + '/contact', changeFrequency: 'monthly', priority: 0.4 },
    { url: BASE + '/faq', changeFrequency: 'monthly', priority: 0.4 },
    { url: BASE + '/shipping-and-returns', changeFrequency: 'yearly', priority: 0.3 },
    { url: BASE + '/privacy', changeFrequency: 'yearly', priority: 0.2 },
    { url: BASE + '/terms', changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const [categories, products] = await Promise.all([listCategories(), listActiveProductSlugs()]);

    return [
      ...staticRoutes,
      ...categories.map((category) => ({
        url: BASE + '/collections/' + category.slug,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
      ...products.map((product) => ({
        url: BASE + '/products/' + product.slug,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ];
  } catch (error) {
    // A database blip must not serve an empty sitemap that de-indexes the site.
    logger.error({ err: error }, 'sitemap generation fell back to static routes');
    return staticRoutes;
  }
}
