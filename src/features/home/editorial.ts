import { collectionPath, type CollectionSlug } from '@/features/catalog/routes';

/** Homepage editorial spotlights — CarBone-style “Discover” stories. */
export type EditorialStory = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  href: `/collections/${CollectionSlug}`;
  cta: string;
  image: string;
  imageAlt: string;
};

export const HOME_EDITORIAL_STORIES: EditorialStory[] = [
  {
    id: 'monsoon-c4',
    kicker: 'All-weather',
    title: 'Built for the monsoon commute',
    body: 'Channelled trays that swallow muddy shoes and monsoon run-off — lift, rinse, refit before the next drive.',
    href: collectionPath('all-weather'),
    cta: 'Discover',
    image: 'motormats/zones/all-weather',
    imageAlt: 'Channelled all-weather mats holding water in the tray',
  },
  {
    id: 'carbon-cabin',
    kicker: 'Carbon series',
    title: 'Technical weave, quiet cabin',
    body: 'Low-gloss carbon pattern that reads like factory trim — not a universal sheet trimmed with scissors.',
    href: collectionPath('carbon'),
    cta: 'Discover',
    image: 'motormats/collections/carbon',
    imageAlt: 'Carbon weave car mats fitted in a modern sedan',
  },
  {
    id: '7d-luxury',
    kicker: '7D luxury',
    title: 'Deep lip, zero spill-through',
    body: 'Raised walls follow your scanned floorpan so coffee stops at the mat — not under the carpet.',
    href: collectionPath('7d-luxury'),
    cta: 'Discover',
    image: 'motormats/collections/7d-luxury',
    imageAlt: '7D luxury mats with raised edges in a car footwell',
  },
];

export const HOME_FINISH_SWATCHES = [
  {
    id: '7d',
    slug: '7d-luxury' as const,
    name: '7D Luxury',
    hue: '#1a1a1a',
    accent: '#E10600',
    texture: 'moulded',
    blurb: 'Deep-dish walls, leather-look surface.',
  },
  {
    id: 'carbon',
    slug: 'carbon' as const,
    name: 'Carbon',
    hue: '#2b2b2b',
    accent: '#737373',
    texture: 'weave',
    blurb: 'Technical weave, low gloss.',
  },
  {
    id: 'carpet',
    slug: 'carpet' as const,
    name: 'Executive carpet',
    hue: '#3d3429',
    accent: '#8b7355',
    texture: 'pile',
    blurb: 'Tufted pile over rubber core.',
  },
  {
    id: 'weather',
    slug: 'all-weather' as const,
    name: 'All-weather',
    hue: '#2a2a2a',
    accent: '#E10600',
    texture: 'channels',
    blurb: 'Channelled TPE — monsoon ready.',
  },
] as const;

export function finishSwatchHref(swatch: (typeof HOME_FINISH_SWATCHES)[number]) {
  return collectionPath(swatch.slug);
}

export const HOME_MAKING_STEPS = [
  {
    step: '01',
    title: 'Scan the floorpan',
    body: 'Patterns start from a 3D scan of the actual vehicle — not a generic template sized “close enough”.',
  },
  {
    step: '02',
    title: 'Cut to your trim',
    body: 'Make, model and year locked at checkout. Pedal clearance and tunnel shape included.',
  },
  {
    step: '03',
    title: 'Finish & inspect',
    body: 'Bound edges, backing bonded, and a visual check before the set is packed.',
  },
  {
    step: '04',
    title: 'Ship to your door',
    body: 'Made after you order. Tracking when the parcel leaves our workshop in Bikaner.',
  },
] as const;
