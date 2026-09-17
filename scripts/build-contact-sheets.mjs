/**
 * Builds labelled contact sheets from the HD shoot so the photographs can be
 * curated by eye rather than by filename.
 *
 * Reads `images-deck/_hd/Images`, writes `images-deck/_sheets/sheet-NN.jpg`.
 * JPEG rather than WebP: the sheets exist to be opened and looked at, and not
 * every image viewer in the loop decodes WebP.
 * Scratch only: both directories are gitignored and neither is ever served.
 *
 * Run: node scripts/build-contact-sheets.mjs
 */
import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const SOURCE = path.join(process.cwd(), 'images-deck', '_hd', 'Images');
const OUT = path.join(process.cwd(), 'images-deck', '_sheets');

/*
 * 214 of the 217 files carry EXIF orientation 8, so the camera wrote them
 * landscape and tagged them to be rotated. Their true orientation is portrait
 * 2:3, and `sharp.rotate()` with no argument is what applies the tag. Without
 * it every thumbnail here came out on its side.
 */
const COLS = 6;
const ROWS = 4;
const THUMB_W = 280;
const THUMB_H = 420; // 2:3
const LABEL_H = 30;
const CELL_H = THUMB_H + LABEL_H;

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const files = (await readdir(SOURCE)).filter((f) => /\.jpe?g$/i.test(f)).sort();
const perSheet = COLS * ROWS;

for (let sheet = 0; sheet * perSheet < files.length; sheet += 1) {
  const batch = files.slice(sheet * perSheet, (sheet + 1) * perSheet);

  const cells = await Promise.all(
    batch.map(async (file, i) => {
      const id = path.basename(file, path.extname(file));
      const thumb = await sharp(path.join(SOURCE, file))
        .rotate()
        .resize(THUMB_W, THUMB_H, { fit: 'cover' })
        .toBuffer();

      const label = Buffer.from(
        `<svg width="${THUMB_W}" height="${LABEL_H}">
           <rect width="${THUMB_W}" height="${LABEL_H}" fill="#111"/>
           <text x="8" y="21" font-family="monospace" font-size="18" fill="#fff">${id}</text>
         </svg>`,
      );

      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return [
        { input: thumb, left: col * THUMB_W, top: row * CELL_H },
        { input: label, left: col * THUMB_W, top: row * CELL_H + THUMB_H },
      ];
    }),
  );

  const name = `sheet-${String(sheet + 1).padStart(2, '0')}.jpg`;
  await sharp({
    create: {
      width: COLS * THUMB_W,
      height: ROWS * CELL_H,
      channels: 3,
      background: '#000',
    },
  })
    .composite(cells.flat())
    .jpeg({ quality: 82 })
    .toFile(path.join(OUT, name));

  console.log(`${name}  ${batch[0]} .. ${batch.at(-1)}`);
}
