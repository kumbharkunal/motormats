// @ts-check
/**
 * The two lockups, normalised onto one frame.
 *
 * The supplied artwork sets "MOTOR" in white, which disappears on a light
 * ground, so a second file sets it in black for light surfaces. They arrived at
 * different sizes with different amounts of transparent padding — 640x159 and
 * 2172x724 — and the header swaps between them as it crosses the cover, so any
 * difference in proportion shows up as the logo changing size mid-scroll.
 *
 * Trimmed to the artwork they are 5.14 and 5.21 wide-to-tall, near enough
 * identical; composed on one frame at the wider of the two they become
 * interchangeable.
 *
 * Run: node scripts/build-brand-logos.mjs
 */
import sharp from 'sharp';

const WIDTH = 640;

const SOURCES = [
  { file: 'public/brand/logo.webp', out: 'public/brand/logo-on-dark.webp' },
  { file: 'public/brand/logo black.webp', out: 'public/brand/logo-on-light.webp' },
];

const trimmed = [];
for (const source of SOURCES) {
  const buffer = await sharp(source.file).trim({ threshold: 0 }).toBuffer({ resolveWithObject: true });
  trimmed.push({ ...source, buffer });
  console.log(`${source.file} -> trimmed ${buffer.info.width}x${buffer.info.height}`);
}

// One frame for both, from the least wide ratio, so neither is cropped and both
// sit at the same optical size.
const ratio = Math.min(...trimmed.map((t) => t.buffer.info.width / t.buffer.info.height));
const height = Math.round(WIDTH / ratio);

for (const entry of trimmed) {
  const scaled = await sharp(entry.buffer.data)
    .resize({ width: WIDTH, height, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp(scaled).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(entry.out);
  console.log(`${entry.out} -> ${WIDTH}x${height}`);
}
