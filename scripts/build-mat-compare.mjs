// @ts-check
/**
 * The before/after mat pair, cut out of the deck.
 *
 * The comparison used to be a drawn floorplan with four wells. It reads as a
 * diagram, and a diagram cannot show the difference between rubber and a woven
 * topsheet — which is the entire argument. So both sides are now one mat: the
 * same silhouette, rubber on the left, woven on the right.
 *
 * One silhouette rather than two photographs is deliberate. Two real mats
 * photographed separately never share an outline, and a wipe between two
 * different outlines reads as a glitch instead of a swap. Here the shape is
 * extracted once from `deck/image45.webp` and used for both sides, so the
 * handle only ever changes the surface.
 *
 * Three things the source needed:
 *
 * 1. The background is white paper, the mat is near-black, and there is a soft
 *    grey drop shadow between them. The alpha comes from a luminance ramp,
 *    which keeps the shadow out (it sits above the ramp) and still leaves an
 *    anti-aliased edge rather than a stair-stepped one.
 * 2. The photograph carries a burnt-in `MOTORMATS` watermark across the lower
 *    third. On the generic side that is a lie, so it is patched over with a
 *    donor block lifted from further up the same mat. The donor comes from
 *    directly above, because the ribs there run vertically and a vertical
 *    translation leaves them continuous.
 * 3. The woven side is filled with the Filigree topsheet, clipped to the same
 *    alpha, with the outer band darkened so the mat keeps a bound edge instead
 *    of ending in raw carpet. The fill is a mirrored tile, not a stretched
 *    photograph: scaling one patch to cover a 947×1557 silhouette blows the
 *    motif up 2.2× and softens it, while mirroring makes the tile's own seams
 *    continuous, so the weave stays at the scale it was shot at.
 *    `photos/detail-weave.webp` was the obvious candidate and the wrong one —
 *    it is a mat being *held*, so the silhouette filled with a man's shirt.
 *
 * Run: node scripts/build-mat-compare.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const SOURCE = 'public/deck/image45.webp';
const OUT = 'public/compare';

/** The weave fill: a clean rectangle of topsheet, clear of badge and binding. */
const WEAVE = {
  file: 'public/surfaces/filigree.webp',
  /* A smaller region of the same photograph, which is how the motif gets
     bigger: the mirrored block is 2× the tile, so the tile itself can never
     exceed half the silhouette, and magnification has to come from taking in
     less of the source rather than scaling the tile up. */
  patch: { left: 380, top: 210, width: 520, height: 400 },
  scale: 470,
};

/** Luminance ramp. Below `solid` is mat, above `clear` is paper and shadow. */
const ALPHA = { solid: 140, clear: 205 };

/** The watermark, and the block that replaces it, in source pixels. */
const WATERMARK = { left: 540, top: 1300, width: 500, height: 165 };
const DONOR_DY = -330;

const EDGE = { blur: 26, threshold: 216, colour: { r: 24, g: 22, b: 21 } };
const MARGIN = 18;

await mkdir(OUT, { recursive: true });

const base = sharp(SOURCE).rotate();
const meta = await base.metadata();
const W = meta.width ?? 0;
const H = meta.height ?? 0;

const rgb = await base.clone().removeAlpha().raw().toBuffer();

// 1 — patch the watermark, copying the donor row by row.
for (let y = 0; y < WATERMARK.height; y += 1) {
  const destY = WATERMARK.top + y;
  const srcY = destY + DONOR_DY;
  if (destY < 0 || destY >= H || srcY < 0 || srcY >= H) continue;
  const destStart = (destY * W + WATERMARK.left) * 3;
  const srcStart = (srcY * W + WATERMARK.left) * 3;
  rgb.copy(rgb, destStart, srcStart, srcStart + WATERMARK.width * 3);
}

// 2 — alpha from luminance, softened first so the ramp lands on a clean edge.
const grey = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
  .greyscale()
  .blur(1.1)
  .raw()
  .toBuffer();

const alpha = Buffer.alloc(W * H);
for (let i = 0; i < alpha.length; i += 1) {
  const lum = grey[i] ?? 255;
  if (lum <= ALPHA.solid) alpha[i] = 255;
  else if (lum >= ALPHA.clear) alpha[i] = 0;
  else alpha[i] = Math.round(255 * (1 - (lum - ALPHA.solid) / (ALPHA.clear - ALPHA.solid)));
}

// 3 — crop both outputs to the silhouette, so the two sides register exactly.
let minX = W;
let minY = H;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < H; y += 1) {
  for (let x = 0; x < W; x += 1) {
    if ((alpha[y * W + x] ?? 0) < 24) continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

const box = {
  left: Math.max(0, minX - MARGIN),
  top: Math.max(0, minY - MARGIN),
  width: Math.min(W, maxX + MARGIN) - Math.max(0, minX - MARGIN),
  height: Math.min(H, maxY + MARGIN) - Math.max(0, minY - MARGIN),
};

const alphaPng = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } })
  .extract(box)
  .png()
  .toBuffer();

const generic = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
  .extract(box)
  .joinChannel(alphaPng)
  .webp({ quality: 88, effort: 5, alphaQuality: 100 })
  .toBuffer();

await sharp(generic).toFile(path.join(OUT, 'mat-generic.webp'));

// 4 — the woven side: weave macro, same alpha, with a bound edge. Eroding the
// mask by blur-and-threshold is what gives the band its width.
const inner = await sharp(alphaPng)
  .blur(EDGE.blur)
  .threshold(EDGE.threshold)
  .toColourspace('b-w')
  .png()
  .toBuffer();

// A 2×2 mirrored block of the patch: every edge meets its own reflection, so
// the repeat has no visible seam to line up.
const patch = await sharp(WEAVE.file)
  .rotate()
  .extract(WEAVE.patch)
  // The mirrored block is 2× this, and a composite tile may not be larger than
  // what it tiles across.
  .resize(Math.min(WEAVE.scale, Math.floor(box.width / 2)))
  .modulate({ brightness: 1.05 })
  .removeAlpha()
  .toBuffer();

const patchMeta = await sharp(patch).metadata();
const pw = patchMeta.width ?? WEAVE.scale;
const ph = patchMeta.height ?? WEAVE.scale;

const tile = await sharp({
  create: { width: pw * 2, height: ph * 2, channels: 3, background: '#000' },
})
  .composite([
    { input: patch, left: 0, top: 0 },
    { input: await sharp(patch).flop().toBuffer(), left: pw, top: 0 },
    { input: await sharp(patch).flip().toBuffer(), left: 0, top: ph },
    { input: await sharp(patch).flip().flop().toBuffer(), left: pw, top: ph },
  ])
  .png()
  .toBuffer();

const weave = await sharp({
  create: { width: box.width, height: box.height, channels: 3, background: '#000' },
})
  .composite([{ input: tile, tile: true, blend: 'over' }])
  .removeAlpha()
  .raw()
  .toBuffer();

const edgeFill = await sharp({
  create: {
    width: box.width,
    height: box.height,
    channels: 3,
    background: EDGE.colour,
  },
})
  .raw()
  .toBuffer();

// The whole mat in the binding colour, with the weave punched back in inside
// the eroded mask: one composite instead of a second alpha pass.
const weaveMasked = await sharp(weave, {
  raw: { width: box.width, height: box.height, channels: 3 },
})
  .joinChannel(inner)
  .png()
  .toBuffer();

// Composite first and flatten back to three bands, then join the silhouette's
// alpha. Joining it straight onto the composite result asks sharp to add a
// fifth band to something that is already RGBA.
const wovenRgb = await sharp(edgeFill, {
  raw: { width: box.width, height: box.height, channels: 3 },
})
  .composite([{ input: weaveMasked }])
  .removeAlpha()
  .raw()
  .toBuffer();

await sharp(wovenRgb, { raw: { width: box.width, height: box.height, channels: 3 } })
  .joinChannel(alphaPng)
  .webp({ quality: 88, effort: 5, alphaQuality: 100 })
  .toFile(path.join(OUT, 'mat-motormats.webp'));

console.log(`source  ${W}x${H}`);
console.log(`cutout  ${box.width}x${box.height} at ${box.left},${box.top}`);
console.log(`ratio   ${(box.width / box.height).toFixed(3)}`);
