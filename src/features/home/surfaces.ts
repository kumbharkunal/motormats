import type { Photo } from '@/features/home/photo-assets';

/**
 * The nine surfaces, as named in `images-deck/motormats naming.pptx`.
 *
 * These are the product names — the thing a customer chooses between once the
 * fit is settled — and they are deliberately not the four catalogue collections
 * (`7d-luxury`, `carbon`, `carpet`, `all-weather`), which describe construction
 * rather than surface. The section used to show those four, which meant the
 * page never named a single one of the actual weaves.
 *
 * Copy is condensed from the deck: each slide runs to a full paragraph, and a
 * card in a rail has room for a line. The taglines are the deck's own, with its
 * double dots resolved into sentences. Riviera's slide carries no tagline, so
 * its line is drawn from its description.
 *
 * Photographs come out of the same deck via `scripts/optimize-surface-photos.mjs`.
 */
export type Surface = Photo & {
  name: string;
  /** Colourway names, exactly as the deck lists them. */
  colors: string[];
  tagline: string;
  body: string;
};

function surface(slug: string, alt: string, rest: Omit<Surface, 'src' | 'ratio' | 'alt'>): Surface {
  return { src: `/surfaces/${slug}.webp`, ratio: '4/3', alt, ...rest };
}

export const SURFACES: Surface[] = [
  surface('strata', 'Two Strata mats, one charcoal and one dune, laid on stone', {
    name: 'Strata',
    colors: ['Obsidian', 'Dune'],
    tagline: 'Subtle by nature. Striking by design.',
    body: 'Stone-inspired depth, with understated linear detailing and a velvety surface.',
  }),
  surface('tweed', 'Tweed mats in ash and truffle, showing the woven topsheet', {
    name: 'Tweed',
    colors: ['Ash', 'Truffle'],
    tagline: 'Character, woven into every detail.',
    body: 'A richly woven surface for interiors that favour texture over excess.',
  }),
  surface('rally', 'A Rally mat with fine vertical lines and ember accents on a wood floor', {
    name: 'Rally',
    colors: ['Ember', 'Cobalt', 'Volt'],
    tagline: 'Go play.',
    body: 'Fine vertical lines and contrast accents, for interiors with a little attitude.',
  }),
  surface('plush', 'Plush mats in onyx and cloud, showing the deep pile', {
    name: 'Plush',
    colors: ['Slate', 'Onyx', 'Cloud'],
    tagline: 'An invitation to slow down.',
    body: 'Dense, deeply piled and soft underfoot. Made to be felt as much as seen.',
  }),
  surface('mosaic', 'Mosaic swatches in mist and charcoal, showing the irregular weave', {
    name: 'Mosaic',
    colors: ['Mist', 'Charcoal'],
    tagline: 'Understated at first glance. Distinctive up close.',
    body: 'Tonal variation in a naturally evolving pattern that rewards a closer look.',
  }),
  surface('heirloom', 'A Heirloom mat in indigo and linen, woven in a check', {
    name: 'Heirloom',
    colors: ['Indigo', 'Linen'],
    tagline: 'Timeless texture, reimagined for the road.',
    body: 'Classic woven textile, in richly textured fibres made from recycled plastic.',
  }),
  surface('riviera', 'Riviera mats fanned out, striped in rosso, siena and azure', {
    name: 'Riviera',
    colors: ['Rosso', 'Siena', 'Azure'],
    tagline: 'Relaxed, refined, radiant.',
    body: 'Bold stripes over a rich weave, shaped by the elegance of coastal escapes.',
  }),
  surface('filigree', 'A Filigree mat in oat, with a fine geometric motif across the weave', {
    name: 'Filigree',
    colors: ['Oat'],
    tagline: 'Intricate enough to intrigue. Refined enough to endure.',
    body: 'A delicate geometric motif, unfolding in loops across a richly woven ground.',
  }),
  surface('boucle', 'Boucle swatches in ash and espresso, showing the looped pile', {
    name: 'Boucle',
    colors: ['Ash', 'Espresso'],
    tagline: 'A rich texture for an even richer experience.',
    body: 'Looped fibres with an organic depth that changes with the light.',
  }),
];
