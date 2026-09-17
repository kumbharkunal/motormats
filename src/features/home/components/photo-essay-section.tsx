'use client';

import { useRef } from 'react';

import { EditorialFrame } from '@/components/media/editorial-frame';
import { PHOTOS } from '@/features/home/photo-assets';
import { useEditorialReveal } from '@/hooks/use-scroll-motion';

/**
 * The plate index.
 *
 * This was a six-plate spread on uneven 7/5 spans with the heading in a block
 * above it. Portrait frames at two different widths are two different heights,
 * so every row ended ragged and the section was mostly the gaps between
 * pictures. Here every cell is one column wide and every photograph is 2:3, so
 * the cells are identical boxes, the rows close flush, and the only separation
 * is a hairline.
 *
 * Nothing is cropped to achieve it — the cell is the picture's own ratio, and
 * the type sits in cells of its own rather than on top of a photograph. Those
 * two written cells are also what squares the count off: six photographs and
 * two panels make eight, which divides into both the two-column and the
 * four-column grid without leaving an orphan. That is why there is no
 * three-column step — eight cells across three columns ends in a half-empty
 * row, which is the gap this section was rebuilt to get rid of.
 *
 * Every frame here is used only here. Padding the grid out to twelve would have
 * meant borrowing four photographs that already appear further up the page.
 */
type Plate = { src: string; alt: string; caption: string };

const PLATES: Plate[] = [
  { ...PHOTOS.essay[0]!, caption: 'Rubber is cheap, it moulds fast, and it never had competition.' },
  { ...PHOTOS.essay[1]!, caption: 'Woven, not printed. The pattern runs all the way through.' },
  { ...PHOTOS.essay[2]!, caption: 'Fit is engineering. Thickness is material. The rest is taste.' },
  { ...PHOTOS.essay[3]!, caption: 'Fifty-five years of carpet-making, pointed at a car floor.' },
  { ...PHOTOS.essay[4]!, caption: 'Lift out, rinse down, refit. No drying time.' },
  { ...PHOTOS.essay[5]!, caption: 'Cut to one car, then finished by hand at the edge.' },
];

/** The two written cells. Index is where each sits in the twelve-cell run. */
const PANELS = [
  {
    at: 0,
    eyebrow: 'Plates 01 — 06',
    title: 'Shot on location',
    body: 'Jaipur, over four days, on the cars and the walls the sets were made for. No renders, no studio floor pretending to be a footwell.',
  },
  {
    at: 5,
    eyebrow: 'On the record',
    title: 'Nothing here is a sample',
    body: 'Every set in this index is a production set, cut to a real floorpan and photographed as it shipped.',
  },
] as const;

export function PhotoEssaySection() {
  const scope = useRef<HTMLElement>(null);

  useEditorialReveal(scope);

  // Woven into one run so the twelve cells stay in reading order at every
  // column count, rather than the panels jumping rows as the grid reflows.
  const cells: Array<{ kind: 'panel'; panel: (typeof PANELS)[number] } | { kind: 'plate'; plate: Plate; index: number }> =
    [];
  let plateIndex = 0;
  for (let position = 0; position < PLATES.length + PANELS.length; position += 1) {
    const panel = PANELS.find((p) => p.at === position);
    if (panel) {
      cells.push({ kind: 'panel', panel });
      continue;
    }
    const plate = PLATES[plateIndex];
    if (!plate) break;
    cells.push({ kind: 'plate', plate, index: plateIndex });
    plateIndex += 1;
  }

  return (
    <section
      ref={scope}
      aria-labelledby="essay-heading"
      className="band-light border-b border-border"
    >
      <ul className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {cells.map((cell) =>
          cell.kind === 'panel' ? (
            <li
              key={cell.panel.title}
              data-reveal
              className="flex flex-col justify-between gap-10 bg-ink p-6 text-white md:p-8"
            >
              <p className="caps text-eyebrow text-white/50">{cell.panel.eyebrow}</p>
              <div>
                <h2
                  {...(cell.panel.at === 0 ? { id: 'essay-heading' } : {})}
                  className="display-type text-h3 text-white"
                >
                  {cell.panel.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/65">{cell.panel.body}</p>
              </div>
            </li>
          ) : (
            <li key={cell.plate.src} data-reveal className="flex flex-col bg-surface">
              <EditorialFrame
                src={cell.plate.src}
                alt={cell.plate.alt}
                ratio="2/3"
                sizes="(max-width: 1023px) 50vw, 25vw"
              />
              <div className="flex flex-1 items-start gap-3 p-4 md:p-5">
                <span aria-hidden className="caps shrink-0 text-eyebrow text-accent-text">
                  {String(cell.index + 1).padStart(2, '0')}
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">{cell.plate.caption}</p>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
