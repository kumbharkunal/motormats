// @ts-check
/**
 * The nine named surfaces, out of `images-deck/motormats naming.pptx` and into
 * `public/surfaces`.
 *
 * These are not the HD shoot. They are the naming deck's own photographs —
 * mats and swatches on a workshop floor — so a few need a rectangle taken out
 * of them before they can sit in a row together:
 *
 * - `mosaic` is a spread of swatches with two hearts drawn on it in green
 *   marker and a bench of yarn cones behind. The crop is the clean pair at the
 *   bottom left, which is the only heart-free region of the frame.
 * - `boucle` is a swatch card with `CN-04-GREY` and `CN-06-CHARCOAL` printed
 *   under the samples. The crop drops the caption strip.
 * - `rally` uses the deck's *second* picture. Its first is a hand-labelled hank
 *   of green yarn — a production note, not a product.
 *
 * Everything is written at 4:3, which is the native ratio of six of the nine,
 * so most are not cropped at all.
 *
 * Run: node scripts/optimize-surface-photos.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const SRC = 'images-deck/_naming/ppt/media';
const OUT = 'public/surfaces';
const RATIO = 4 / 3;
const MAX_WIDTH = 1400;

/** `crop` is a fraction of the auto-rotated source; omit it to use the frame. */
const SURFACES = [
  { slug: 'strata', file: 'image1.jpg' },
  { slug: 'tweed', file: 'image2.jpg' },
  { slug: 'rally', file: 'image3.jpg' },
  { slug: 'plush', file: 'image6.jpg' },
  {
    slug: 'mosaic',
    file: 'image7.jpg',
    crop: { left: 0, top: 0.515, width: 0.715, height: 0.315 },
  },
  { slug: 'heirloom', file: 'image8.jpg' },
  { slug: 'riviera', file: 'image9.jpg' },
  { slug: 'filigree', file: 'image10.jpg' },
  { slug: 'boucle', file: 'image11.jpg', crop: { left: 0, top: 0, width: 1, height: 0.79 } },
];

await mkdir(OUT, { recursive: true });

const report = [];

for (const surface of SURFACES) {
  const pipeline = sharp(path.join(SRC, surface.file)).rotate();
  const meta = await pipeline.metadata();
  const sourceW = meta.width ?? 0;
  const sourceH = meta.height ?? 0;

  let work = pipeline;
  let cropW = sourceW;

  if (surface.crop) {
    const rect = {
      left: Math.round(sourceW * surface.crop.left),
      top: Math.round(sourceH * surface.crop.top),
      width: Math.round(sourceW * surface.crop.width),
      height: Math.round(sourceH * surface.crop.height),
    };
    work = work.extract(rect);
    cropW = rect.width;
  }

  // Never upscale past 2× the real pixels: a swatch macro tolerates softness,
  // an interpolated smear does not.
  const width = Math.min(MAX_WIDTH, cropW * 2);
  const height = Math.round(width / RATIO);

  await work
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(OUT, `${surface.slug}.webp`));

  report.push(`${surface.slug.padEnd(9)} ${surface.file.padEnd(12)} ${sourceW}x${sourceH} -> ${width}x${height}`);
}

console.log(report.join('\n'));
