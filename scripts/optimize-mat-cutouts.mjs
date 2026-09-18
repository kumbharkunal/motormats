// @ts-check
/**
 * The ten mat cutouts in `motormats/mats/` into `public/products/`.
 *
 * Three things this script exists to get right:
 *
 * **Alpha survives.** Every source is a genuine transparent cutout. The previous
 * version flattened onto white, which was correct when the card plate was white
 * and is wrong now that it is `--color-paper` — a flattened mat shows a white
 * rectangle sitting on a bone card. Keeping alpha also lets the card cast a
 * `drop-shadow` from the mat's own silhouette rather than from its bounding box.
 *
 * **Uniform composition.** Trimmed to content, the ten mats range from 0.70 to
 * 0.91 in aspect, so dropping them straight into a grid gives ten different
 * apparent sizes. Each is instead trimmed, scaled to the same share of the frame
 * height, and centred on one 4:5 transparent canvas — so a row of cards reads as
 * one shoot rather than ten crops. Transparent margin costs almost nothing in
 * WebP.
 *
 * **No upscaling.** The frame heights are chosen so `FILL` never exceeds the
 * shortest trimmed source (1264px). Sharpening a cutout that was never that big
 * only makes the binding look noisy.
 *
 * Run: node scripts/optimize-mat-cutouts.mjs
 */
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const SRC = 'motormats/mats';
const OUT = 'public/products';
const MANIFEST = 'src/features/catalog/mat-cutouts.ts';

/** 4:5 portrait. The card plate is built at this ratio, so nothing crops. */
const WIDTHS = [480, 720, 960];
const RATIO = 5 / 4;

/** Share of the frame height the mat occupies, leaving an even optical margin. */
const FILL = 0.92;

/**
 * `legacy` is the asset id the catalogue rows already hold. Those four files are
 * rewritten in place from the same composed plate, so the database is never
 * touched and a deploy can never leave production pointing at a file that has
 * not shipped yet.
 */
const MATS = [
  { file: '1.webp', slug: 'tan-diamond', name: 'Tan diamond weave', legacy: '1.webp' },
  { file: '2.webp', slug: 'blue-plaid', name: 'Cobalt plaid', legacy: '2.webp' },
  { file: '3.webp', slug: 'graphite-rib', name: 'Graphite centre rib', legacy: '3.webp' },
  { file: '4.webp', slug: 'camel-rib', name: 'Camel tonal rib', legacy: '4.webp' },
  { file: '5.webp', slug: 'ash-check', name: 'Ash check' },
  { file: '6.webp', slug: 'onyx-honeycomb', name: 'Onyx honeycomb' },
  { file: '7.webp', slug: 'silver-plush', name: 'Silver plush' },
  { file: '8.webp', slug: 'cobalt-stripe', name: 'Cobalt stripe' },
  { file: '9.webp', slug: 'walnut-stripe', name: 'Walnut stripe' },
  { file: '10.webp', slug: 'crimson-stripe', name: 'Crimson stripe' },
];

await mkdir(OUT, { recursive: true });

/** @type {string[]} */
const entries = [];
/** @type {string[]} */
const aliases = [];

for (const [index, mat] of MATS.entries()) {
  const id = String(index + 1).padStart(2, '0');

  // Trim first, then compose: the source margins are uneven, so centring the
  // untrimmed frame would centre the padding rather than the mat.
  const trimmed = await sharp(path.join(SRC, mat.file))
    .trim({ threshold: 0 })
    .toBuffer({ resolveWithObject: true });

  /** @type {string[]} */
  const sources = [];

  for (const frameWidth of WIDTHS) {
    const frameHeight = Math.round(frameWidth * RATIO);

    let height = Math.round(frameHeight * FILL);
    let width = Math.round(trimmed.info.width * (height / trimmed.info.height));

    // A mat wider than the frame is capped on width instead, so the margin is
    // never eaten on the side the binding sits.
    const maxWidth = Math.round(frameWidth * FILL);
    if (width > maxWidth) {
      height = Math.round(height * (maxWidth / width));
      width = maxWidth;
    }

    const plate = await sharp(trimmed.data)
      .resize(width, height, { fit: 'fill' })
      .toBuffer();

    const name = `mat-${id}-${mat.slug}-${frameWidth}.webp`;

    await sharp({
      create: {
        width: frameWidth,
        height: frameHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: plate, gravity: 'center' }])
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toFile(path.join(OUT, name));

    sources.push(`/products/${name} ${frameWidth}w`);

    // The legacy id the catalogue stores, rewritten from the same plate at the
    // widest size. Anything that does not go through the lookup — the product
    // gallery, OG tags — then serves ~200KB instead of the 2MB master.
    if (mat.legacy && frameWidth === WIDTHS[WIDTHS.length - 1]) {
      await sharp(path.join(OUT, name)).toFile(path.join(OUT, `.tmp-${mat.legacy}`));
      await rename(path.join(OUT, `.tmp-${mat.legacy}`), path.join(OUT, mat.legacy));
      aliases.push(`  '/products/${mat.legacy}': MAT_CUTOUTS['${mat.slug}'],`);
    }
  }

  const widest = WIDTHS[WIDTHS.length - 1];
  entries.push(
    [
      `  '${mat.slug}': {`,
      `    name: '${mat.name}',`,
      `    src: '/products/mat-${id}-${mat.slug}-${widest}.webp',`,
      `    srcSet: '${sources.join(', ')}',`,
      `    width: ${widest},`,
      `    height: ${Math.round(widest * RATIO)},`,
      `    alt: '${mat.name} Motormats car mat, photographed flat',`,
      `  },`,
    ].join('\n'),
  );

  console.log(`mat-${id}-${mat.slug.padEnd(16)} ${trimmed.info.width}x${trimmed.info.height}`);
}

const aliasBlock = aliases.join('\n');

const manifest = `// Generated by scripts/optimize-mat-cutouts.mjs — do not edit by hand.
//
// The ten mat cutouts, each composed on the same 4:5 transparent frame at three
// widths. \`srcSet\` is consumed by \`MatPlate\`, which renders a plain <img> —
// \`next/image\`'s custom loader has no resizer in front of \`public/\`, so native
// srcset is the only path here that actually serves a smaller file.

export type MatCutout = {
  name: string;
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
};

export const MAT_CUTOUTS = {
${entries.join('\n')}
} as const satisfies Record<string, MatCutout>;

export type MatCutoutSlug = keyof typeof MAT_CUTOUTS;

const BY_SRC: Record<string, MatCutout> = {
  ...Object.fromEntries(Object.values(MAT_CUTOUTS).map((cutout) => [cutout.src, cutout])),

  // The ids the seeded catalogue rows already hold. Mapping them here rather
  // than rewriting the rows keeps the database out of this entirely: dev and
  // production are the same MySQL instance, so a repoint would take effect for
  // live traffic the moment it ran, pointing at files that only exist after the
  // next deploy. These four files still exist and are now optimised too.
${aliasBlock}
};

/**
 * The cutout a stored assetId refers to, or null for anything else.
 *
 * A product row holds one asset id, but these plates ship at three widths. The
 * card looks the id up here to recover the full srcSet; a Cloudinary id, or any
 * other local file, misses and falls back to next/image.
 */
export function matCutoutForAsset(assetId: string | null | undefined): MatCutout | null {
  if (!assetId) return null;
  return BY_SRC[assetId] ?? null;
}
`;

await writeFile(MANIFEST, manifest, 'utf8');
console.log(`\nmanifest -> ${MANIFEST}`);
