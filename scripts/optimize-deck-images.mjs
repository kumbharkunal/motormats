/**
 * Re-encodes `public/deck` to full-resolution WebP.
 *
 * The PowerPoint export is 64 MB of PNG and JPEG at 1080x1350 or 1080x1920.
 * The pixel dimensions are already right for a phone-first magazine layout, so
 * nothing is downscaled here: only the encoding changes, which is where the
 * weight is. Originals stay in `images-deck/_extract/ppt/media`.
 *
 * Run: node scripts/optimize-deck-images.mjs
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const DECK_DIR = path.join(process.cwd(), 'public', 'deck');

const files = await readdir(DECK_DIR);
let before = 0;
let after = 0;

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

  const source = path.join(DECK_DIR, file);
  const target = path.join(DECK_DIR, `${path.basename(file, ext)}.webp`);

  before += (await stat(source)).size;
  await sharp(source).webp({ quality: 88, effort: 6 }).toFile(target);
  after += (await stat(target)).size;
  await unlink(source);
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
console.log(`deck: ${mb(before)} -> ${mb(after)}`);
