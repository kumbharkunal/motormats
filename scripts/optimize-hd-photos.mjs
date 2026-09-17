/**
 * Converts the curated frames of the HD shoot into `public/photos`.
 *
 * Two things this script exists to get right:
 *
 * **Orientation.** 214 of the 217 camera files are written landscape with EXIF
 * orientation 8, meaning "rotate when displaying". Their true orientation is
 * portrait 2:3. `sharp.rotate()` with no argument applies the tag and strips it,
 * so the output file needs no interpretation by the browser. Skip it and every
 * photograph on the site lies on its side.
 *
 * **Curation.** Only the frames listed below ship. The shoot has long bursts of
 * near-duplicates and a run of motion-blurred overheads, so picking by hand is
 * the difference between a magazine and a camera roll.
 *
 * Run: node scripts/optimize-hd-photos.mjs
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const SOURCE = path.join(process.cwd(), 'images-deck', '_hd', 'Images');
const OUT = path.join(process.cwd(), 'public', 'photos');

/** `[source id, output name]`. Every frame is portrait 2:3 after auto-rotation. */
const FRAMES = [
  // Cover. Dark studio light-tunnel frame, so white type and the two CTAs read
  // over it without a heavy scrim.
  ['SID02654', 'cover-tunnel'],

  // Macro detail.
  ['SID02231', 'detail-badge'],
  ['SID02466', 'detail-crest'],
  ['SID02275', 'detail-weave'],
  ['SID02374', 'detail-radial'],
  ['SID02470', 'detail-stack'],

  // Photo essay.
  ['SID02243', 'essay-railing'],
  ['SID02255', 'essay-statue'],
  ['SID02262', 'essay-headlight'],
  ['SID02366', 'essay-door'],
  ['SID02290', 'essay-cabin'],
  ['SID02384', 'essay-logo'],

  // The four ranges.
  ['SID02457', 'range-7d'],
  ['SID02301', 'range-carbon'],
  ['SID02469', 'range-carpet'],
  ['SID02399', 'range-weather'],

  // Product zones.
  ['SID02462', 'zone-fit'],
  ['SID02397', 'zone-weather'],

  // Editorial features.
  ['SID02289', 'story-monsoon'],
  ['SID02303', 'story-carbon'],
  ['SID02455', 'story-luxury'],

  // Installed interiors.
  ['SID02453', 'interior-wide'],
  ['SID02463', 'interior-driver'],

  // Gallery and lifestyle.
  ['SID02268', 'gallery-vintage'],
  ['SID02376', 'gallery-heritage'],
  ['SID02385', 'gallery-sandstone'],
  ['SID02449', 'lifestyle-table'],
  ['SID02493', 'lifestyle-group'],

  // Made to order.
  ['SID02472', 'order-trolley'],
  ['SID02487', 'order-stack'],
];

/** The cover runs full-bleed on a desktop viewport, so it needs a wider master. */
const COVER_WIDTH = 2560;
const PLATE_WIDTH = 1600;

await mkdir(OUT, { recursive: true });
const available = new Set(await readdir(SOURCE));

let total = 0;
const missing = [];

for (const [id, name] of FRAMES) {
  const file = `${id}.JPG`;
  if (!available.has(file)) {
    missing.push(id);
    continue;
  }

  const width = name === 'cover-tunnel' ? COVER_WIDTH : PLATE_WIDTH;
  const target = path.join(OUT, `${name}.webp`);

  const info = await sharp(path.join(SOURCE, file))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 86, effort: 6 })
    .toFile(target);

  total += (await stat(target)).size;
  console.log(`${name.padEnd(20)} ${id}  ${info.width}x${info.height}`);
}

if (missing.length > 0) console.warn(`missing sources: ${missing.join(', ')}`);
console.log(`\n${FRAMES.length - missing.length} frames, ${(total / 1024 / 1024).toFixed(1)} MB`);
