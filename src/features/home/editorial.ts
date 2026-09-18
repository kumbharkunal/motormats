import { collectionPath, type CollectionSlug } from '@/features/catalog/routes';
import { PHOTOS } from '@/features/home/photo-assets';

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
    image: PHOTOS.stories.monsoon.src,
    imageAlt: PHOTOS.stories.monsoon.alt,
  },
  {
    id: 'carbon-cabin',
    kicker: 'Carbon series',
    title: 'Technical weave, quiet cabin',
    body: 'Low-gloss carbon pattern that reads like factory trim — not a universal sheet trimmed with scissors.',
    href: collectionPath('carbon'),
    cta: 'Discover',
    image: PHOTOS.stories.carbon.src,
    imageAlt: PHOTOS.stories.carbon.alt,
  },
  {
    id: '7d-luxury',
    kicker: '7D luxury',
    title: 'Deep lip, zero spill-through',
    body: 'Raised walls follow your scanned floorpan so coffee stops at the mat — not under the carpet.',
    href: collectionPath('7d-luxury'),
    cta: 'Discover',
    image: PHOTOS.stories.luxury7d.src,
    imageAlt: PHOTOS.stories.luxury7d.alt,
  },
];
