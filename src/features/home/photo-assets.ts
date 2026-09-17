import type { FrameRatio } from '@/components/media/editorial-frame';

/**
 * The HD shoot, curated down to 30 frames and converted into `public/photos`
 * by `scripts/optimize-hd-photos.mjs`.
 *
 * Every frame is portrait 2:3. The camera wrote the originals landscape with
 * EXIF orientation 8, which is why the ratio here is 2:3 and not 3:2 — the
 * conversion applies the tag and bakes the rotation in.
 *
 * This is now the primary photography for the homepage. The deck export in
 * `deck-assets.ts` is kept only for the Instagram reels posters, which need a
 * 9:16 story frame the shoot does not contain.
 */
export type Photo = {
  src: string;
  ratio: FrameRatio;
  alt: string;
};

function frame(name: string, alt: string): Photo {
  return { src: `/photos/${name}.webp`, ratio: '2/3', alt };
}

export const PHOTOS = {
  /**
   * The cover. A dark light-tunnel frame, chosen so white type and the two CTAs
   * carry over it without a scrim heavy enough to flatten the picture.
   */
  cover: frame(
    'cover-tunnel',
    'A dark SUV in a studio light tunnel with a striped Motormats set laid across the bonnet',
  ),

  detail: {
    badge: frame('detail-badge', 'The Motormats badge stitched into a grey woven mat'),
    crest: frame('detail-crest', 'A dark carpet mat photographed beside a car maker crest'),
    weave: frame('detail-weave', 'The woven surface at close range, the pattern running through the pile'),
    radial: frame('detail-radial', 'A mat fanned open to show the radial weave'),
    stack: frame('detail-stack', 'Two finished mats stacked, showing the bound edge'),
  },

  essay: [
    frame('essay-railing', 'A tan woven mat held against a green railing and pink sandstone'),
    frame('essay-statue', 'A stone statue carrying a blue Motormats set'),
    frame('essay-headlight', 'A cream mat laid over the headlight of a vintage car'),
    frame('essay-door', 'A blue striped mat against a teal and gold painted door'),
    frame('essay-cabin', 'A mat held inside the cabin of a vintage car'),
    frame('essay-logo', 'The Motormats logo on a perforated mat'),
  ] satisfies Photo[],

  ranges: {
    '7d-luxury': frame('range-7d', '7D Luxury mats fitted in a cream leather cabin'),
    carbon: frame('range-carbon', 'A carbon weave mat held against a red pickup grille'),
    carpet: frame('range-carpet', 'An executive carpet set fanned out beside the steering wheel'),
    'all-weather': frame('range-weather', 'All-weather mats laid over a blue bonnet before fitting'),
  },

  zones: {
    madeToFit: frame('zone-fit', 'A mat cut to sit flush in the driver footwell'),
    allWeather: frame('zone-weather', 'All-weather mats on a car bonnet before fitting'),
  },

  stories: {
    monsoon: frame('story-monsoon', 'A mat lifted out of a vintage car interior in one piece'),
    carbon: frame('story-carbon', 'A carbon weave mat held against a red bonnet'),
    luxury7d: frame('story-luxury', 'A 7D Luxury mat seated in a cream footwell'),
  },

  interiors: {
    wide: frame('interior-wide', 'A fitted set seen across the cabin from the passenger side'),
    driver: frame('interior-driver', 'The driver footwell with the mat fitted under the pedals'),
  },

  gallery: [
    { ...frame('gallery-vintage', 'A man carrying a Motormats set beside a vintage green car'), label: 'On location' },
    { ...frame('gallery-heritage', 'A Motormats set held in front of a heritage green facade'), label: 'The heritage set' },
    { ...frame('gallery-sandstone', 'A checked mat held against a sandstone wall'), label: 'Checked weave' },
  ],

  order: {
    trolley: frame('order-trolley', 'A trolley of finished mat sets outside a heritage hotel'),
    stack: frame('order-stack', 'Finished sets stacked and rolled for delivery'),
  },

  lifestyle: {
    table: frame('lifestyle-table', 'Mats used as table settings at an outdoor gathering'),
    group: frame('lifestyle-group', 'Three men standing in a heritage courtyard with a mat set'),
  },
} as const;

/**
 * The cover's fading banner run.
 *
 * Cabin and surface frames only. The cover crops to a landscape panel on a
 * desktop viewport, and these are the frames whose subject sits in the middle
 * third of a 2:3 portrait — an environmental shot loses its subject entirely at
 * that crop, which is why the courtyard and trolley frames are not here.
 */
export const HERO_BANNERS = [
  PHOTOS.interiors.wide,
  PHOTOS.zones.madeToFit,
  PHOTOS.ranges['7d-luxury'],
  PHOTOS.interiors.driver,
  PHOTOS.ranges.carpet,
  PHOTOS.detail.weave,
] satisfies Photo[];

