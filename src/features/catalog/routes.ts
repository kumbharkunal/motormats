/**
 * Canonical catalogue URLs — slugs match `db/seed.ts` categories.
 * Import here instead of hardcoding `/collections/...` across the site.
 */
export const COLLECTION_SLUGS = ['7d-luxury', 'carbon', 'carpet', 'all-weather'] as const;

export type CollectionSlug = (typeof COLLECTION_SLUGS)[number];

export function isCollectionSlug(value: string): value is CollectionSlug {
  return (COLLECTION_SLUGS as readonly string[]).includes(value);
}

export function collectionPath(slug: CollectionSlug): `/collections/${CollectionSlug}` {
  return `/collections/${slug}`;
}

export function collectionsPath(search?: {
  brand?: string;
  model?: string;
  year?: number | string;
  fit?: boolean;
  sort?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (search?.brand) params.set('brand', search.brand);
  if (search?.model) params.set('model', search.model);
  if (search?.year) params.set('year', String(search.year));
  if (search?.fit) params.set('fit', '1');
  if (search?.sort) params.set('sort', search.sort);
  if (search?.page && search.page > 1) params.set('page', String(search.page));
  const q = params.toString();
  return q ? `/collections?${q}` : '/collections';
}

/** Primary marketing routes used on the homepage and nav. */
export const SHOP_ROUTES = {
  findYourFit: '/find-your-fit',
  collections: '/collections',
  ourStory: '/our-story',
  gallery: '/gallery',
  contact: '/contact',
  faq: '/faq',
  shippingReturns: '/shipping-and-returns',
  instagram: 'https://www.instagram.com/motormats.in/',
} as const;

export const COLLECTION_CARDS = [
  {
    slug: '7d-luxury' as const,
    name: '7D Luxury',
    tagline: 'Deep-dish moulding',
    body: 'A raised lip that contains a spill before it ever reaches the carpet underneath.',
    image: 'motormats/collections/7d-luxury',
  },
  {
    slug: 'carbon' as const,
    name: 'Carbon',
    tagline: 'Technical weave',
    body: 'A carbon-weave topsheet with a low-gloss finish that sheds dust instead of trapping it.',
    image: 'motormats/collections/carbon',
  },
  {
    slug: 'carpet' as const,
    name: 'Carpet',
    tagline: 'Executive pile',
    body: 'Tufted pile over moulded rubber — warmer underfoot, reinforced where the heel lands.',
    image: 'motormats/collections/carpet',
  },
  {
    slug: 'all-weather' as const,
    name: 'All-Weather',
    tagline: 'Monsoon ready',
    body: 'Channelled trays that hold the water. Lift out, rinse down, refit — no drying time.',
    image: 'motormats/collections/all-weather',
  },
] as const;
