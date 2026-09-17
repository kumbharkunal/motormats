// @ts-check
/**
 * The four raw mat cutouts in `motormats/mats/` into `public/products/`.
 *
 * Each source is a genuine transparent cutout (`hasAlpha: true`), so it is
 * flattened onto white before compression — the existing Cloudinary product
 * shots are all "laid flat on a white background" per their alt text, and a
 * flattened plate avoids a double-transparency stack with the card's own
 * `bg-surface` wrapper underneath it.
 *
 * Run: node scripts/optimize-mat-cutouts.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const SRC = 'motormats/mats';
const OUT = 'public/products';
const MAX_WIDTH = 900;

const FILES = [
  { file: '1.webp', slug: 'mat-cutout-tan' },
  { file: '2.png', slug: 'mat-cutout-blue-plaid' },
  { file: '3.webp', slug: 'mat-cutout-grey-rib' },
  { file: '4.webp', slug: 'mat-cutout-tan-rib' },
];

await mkdir(OUT, { recursive: true });

for (const { file, slug } of FILES) {
  const src = sharp(path.join(SRC, file));
  const meta = await src.metadata();
  const width = Math.min(MAX_WIDTH, meta.width ?? MAX_WIDTH);

  await src
    .flatten({ background: '#ffffff' })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(OUT, `${slug}.webp`));

  console.log(`${slug.padEnd(22)} ${file.padEnd(10)} ${meta.width}x${meta.height} -> ${width}w`);
}
