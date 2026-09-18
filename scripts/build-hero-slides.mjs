// @ts-check
/**
 * The cover's rotating frames, cut for both shapes of band.
 *
 * **Drop files in `motormats/hero-masters/` and rerun.** Nothing in this file
 * needs editing to add a slide. The folder is the source of truth and the
 * filename carries everything the build needs:
 *
 *     NN-slug-wide.jpg   the landscape master, for a desktop band
 *     NN-slug-tall.jpg   the portrait master, for a phone
 *
 * `NN` is a two-digit number that sets the order. Supply both orientations when
 * you have them; supply one and it is cropped to the other, which is fine when
 * the subject sits inside the crop and disastrous when it does not — a portrait
 * photograph cut to 16:9 keeps about a third of its height.
 *
 * Alt text lives in `alt.json` beside the images, keyed by slug. It is required:
 * a cover photograph with no description is a cover photograph a screen reader
 * cannot report, and inventing one in code would be worse than failing here.
 *
 * `focusX` / `focusY` in that file say where the subject is, as a fraction of
 * the source, for when a crop has to choose. A centred crop is only right when
 * the subject is centred. The two bands rarely want the same point out of one
 * photograph — a wide band wants the horizon the subject sits on, a phone wants
 * the subject itself — so a slug may also carry `wide` and `tall` objects with
 * their own `focusX` / `focusY`, each falling back to the slug's pair.
 *
 * The folder is gitignored — masters never ship. The webp output here is what
 * gets committed.
 *
 * Run: node scripts/build-hero-slides.mjs
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const SOURCE = 'motormats/hero-masters';
const OUT = 'public/photos/hero';

/** Wide enough for a 2560 band; tall enough for a 3x phone. */
const WIDE = { ratio: 16 / 9, widths: [1280, 1920, 2560] };
const TALL = { ratio: 9 / 16, widths: [640, 828, 1080] };

const NAME = /^(\d{2})-([a-z0-9-]+)-(wide|tall)\.(jpe?g|png|webp)$/i;

const entries = await readdir(SOURCE);
const alt = JSON.parse(await readFile(path.join(SOURCE, 'alt.json'), 'utf8'));

/** @type {Map<string, { order: string; wide?: string; tall?: string }>} */
const slides = new Map();

for (const file of entries) {
  const match = NAME.exec(file);
  if (!match) {
    if (file !== 'alt.json') console.warn(`skipped ${file} — expected NN-slug-wide|tall.ext`);
    continue;
  }
  const [, order, slug, orientation] = match;
  const slide = slides.get(slug) ?? { order };
  slide[orientation.toLowerCase()] = path.join(SOURCE, file);
  slides.set(slug, slide);
}

const ordered = [...slides.entries()].sort((a, b) => a[1].order.localeCompare(b[1].order));
if (ordered.length === 0) throw new Error(`No hero masters found in ${SOURCE}`);

await mkdir(OUT, { recursive: true });

/**
 * The largest box of `ratio` that fits inside the source, positioned on the
 * focus point and clamped so it never runs off an edge.
 */
function crop(width, height, ratio, focusX, focusY) {
  let w = width;
  let h = Math.round(w / ratio);
  if (h > height) {
    h = height;
    w = Math.round(h * ratio);
  }
  const left = Math.min(Math.max(Math.round(width * focusX - w / 2), 0), width - w);
  const top = Math.min(Math.max(Math.round(height * focusY - h / 2), 0), height - h);
  return { left, top, width: w, height: h };
}

/**
 * The size the image actually is once the EXIF orientation has been applied.
 *
 * `metadata()` reports the stored buffer, not the upright picture, and it keeps
 * doing so through `.rotate()` — that call only queues the rotation. A camera
 * held on its side writes orientation 5-8 and stores the frame landscape, so
 * reading `width`/`height` straight off a portrait photograph hands you the two
 * numbers the wrong way round, and the `extract` computed from them is wider
 * than the image it lands on. Every frame from the client's shoot is stored
 * this way.
 */
async function upright(source) {
  const info = await sharp(source).metadata();
  const sideways = (info.orientation ?? 1) >= 5;
  return {
    width: (sideways ? info.height : info.width) ?? 0,
    height: (sideways ? info.width : info.height) ?? 0,
  };
}

/** @type {string[]} */
const manifestEntries = [];

for (const [slug, slide] of ordered) {
  const meta = alt[slug];
  if (!meta?.alt) {
    throw new Error(`${SOURCE}/alt.json is missing an "alt" for "${slug}". Every cover frame needs a description.`);
  }
  const focusX = meta.focusX ?? 0.5;
  const focusY = meta.focusY ?? 0.5;
  /** @type {(name: string) => { x: number; y: number }} */
  const focusFor = (name) => ({
    x: meta[name]?.focusX ?? focusX,
    y: meta[name]?.focusY ?? focusY,
  });

  /** @type {Record<string, { set: string[]; src: string; width: number; height: number }>} */
  const cuts = {};

  for (const [name, spec] of [
    ['wide', WIDE],
    ['tall', TALL],
  ]) {
    // Prefer a master shot in this orientation; fall back to the other one.
    const source = slide[name] ?? slide[name === 'wide' ? 'tall' : 'wide'];
    const borrowed = !slide[name];

    const info = await upright(source);
    const focus = focusFor(name);
    const region = crop(info.width, info.height, spec.ratio, focus.x, focus.y);
    const slice = await sharp(source).rotate().extract(region).toBuffer();

    /** @type {string[]} */
    const set = [];
    let widest = 0;

    for (const target of spec.widths) {
      const emitted = Math.min(target, region.width);
      if (emitted <= widest) continue;
      const file = `${slug}-${name}-${emitted}.webp`;
      await sharp(slice)
        .resize({ width: emitted, withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toFile(path.join(OUT, file));
      set.push(`/photos/hero/${file} ${emitted}w`);
      widest = emitted;
    }

    cuts[name] = {
      set,
      src: `/photos/hero/${slug}-${name}-${widest}.webp`,
      width: widest,
      height: Math.round(widest / spec.ratio),
    };

    const kept = Math.round((region.height / (info.height || 1)) * 100);
    console.log(
      `${slug.padEnd(16)} ${name.padEnd(5)} ${widest}w` +
        (borrowed ? `  (cropped from the ${name === 'wide' ? 'tall' : 'wide'} master — keeps ${kept}% of its height)` : ''),
    );
  }

  manifestEntries.push(
    [
      '  {',
      `    slug: '${slug}',`,
      `    wide: { src: '${cuts.wide.src}', srcSet: '${cuts.wide.set.join(', ')}', width: ${cuts.wide.width}, height: ${cuts.wide.height} },`,
      `    tall: { src: '${cuts.tall.src}', srcSet: '${cuts.tall.set.join(', ')}', width: ${cuts.tall.width}, height: ${cuts.tall.height} },`,
      `    alt: '${String(meta.alt).replace(/'/g, "\'")}',`,
      '  },',
    ].join('\n'),
  );
}

const manifest = `// Generated by scripts/build-hero-slides.mjs — do not edit by hand.
//
// Two cuts per frame: a 16:9 landscape for the desktop band and a 9:16 portrait
// for a phone. The cover picks between them with <picture>, so each viewport
// gets a frame shaped like the space it has to fill and nothing is letterboxed.
//
// To add a frame, drop masters into motormats/hero-masters/ and rerun the script.

export type HeroCut = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
};

export type HeroSlide = {
  slug: string;
  wide: HeroCut;
  tall: HeroCut;
  alt: string;
};

export const HERO_SLIDES: HeroSlide[] = [
${manifestEntries.join('\n')}
];
`;

await writeFile('src/features/home/hero-slides.ts', manifest, 'utf8');
console.log(`\n${ordered.length} slide(s) -> src/features/home/hero-slides.ts`);
