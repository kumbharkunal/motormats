'use client';

import { useRef } from 'react';

import { PROCESS_ART } from '@/features/home/process-art';
import { useEditorialReveal, useHeadlineReveal } from '@/hooks/use-scroll-motion';

/**
 * How a mat gets made, in five drawn steps.
 *
 * **The art is the client's, and it sets the rules.** The five illustrations
 * are line drawings on their own warm off-white ground, within a shade or two
 * of `--color-paper`. That is why each one sits in a hairline card rather than
 * floating on the band: a drawn rectangle whose background almost — but not
 * quite — matches the page reads as a printing error, while the same rectangle
 * inside a ruled box reads as a plate. The card is doing colour-management work,
 * not decoration.
 *
 * **Centred, unlike every other band.** `SectionIntro` is deliberately
 * asymmetric — headline left, support copy across the gutter — and that shape
 * needs a right-hand column to balance it. This band has none: five equal steps
 * under one title. So the heading is written out here, still carrying
 * `data-headline` so `useHeadlineReveal` finds it.
 *
 * The steps are an `<ol>`, so the order is in the markup rather than only in the
 * numerals, and the arrows the previous version drew between cards are gone —
 * they were decorative, hidden from the accessibility tree, and had to be
 * rendered invisibly on the last step to stop it sitting lower than the rest.
 */

const STEPS = [
  {
    index: '01',
    name: 'Scan',
    body: 'We map the actual floorpan of your exact vehicle.',
    alt: 'A laptop showing a vehicle alongside the mat shapes scanned from it',
  },
  {
    index: '02',
    name: 'Engineer',
    body: 'The scan becomes a vehicle-specific pattern.',
    alt: 'Hands drawing a cutting line across a mat laid on a gridded bench',
  },
  {
    index: '03',
    name: 'Cut',
    body: 'Material is precision-cut to the pattern.',
    alt: 'A machine running along the edge of a mat, following the pattern',
  },
  {
    index: '04',
    name: 'Finish',
    body: 'Edges are bound and every set is inspected.',
    alt: 'Two hands holding up a finished mat with a bound red edge',
  },
  {
    index: '05',
    name: 'Deliver',
    body: 'Made to order and shipped to your door.',
    alt: 'A Motormats box open on a stack of finished mats',
  },
];

export function ProcessSection() {
  const scope = useRef<HTMLElement>(null);
  useEditorialReveal(scope);
  useHeadlineReveal(scope);

  return (
    <section
      ref={scope}
      aria-labelledby="process-heading"
      className="screen-section band-light border-b border-border"
    >
      <div className="container-page py-section">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          {/*
            The eyebrow's rules are drawn with flex children rather than
            pseudo-elements so they share the row's own centring and shrink with
            it — at 320px the label keeps its width and the rules give way.
          */}
          <p className="flex items-center justify-center gap-4">
            <span aria-hidden className="h-px min-w-4 flex-1 bg-border" />
            <span className="caps text-eyebrow text-accent-text">After you order</span>
            <span aria-hidden className="h-px min-w-4 flex-1 bg-border" />
          </p>

          {/* The clip has to be the element that does not move; `pb` is
              descender room for the "p" in "floorpan". */}
          <h2
            id="process-heading"
            className="mt-5 overflow-hidden pb-[0.12em] text-h2 text-foreground"
          >
            <span data-headline className="display-type block">
              From floorpan to finished mat
            </span>
          </h2>
        </div>

        <ol className="native-scroll -mx-(--gutter-page) mt-12 flex snap-x snap-mandatory gap-4 px-(--gutter-page) md:mt-16 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
          {STEPS.map((step, i) => {
            const art = PROCESS_ART[i];

            return (
              <li
                key={step.index}
                data-reveal
                className="flex w-60 shrink-0 snap-start flex-col border border-border bg-surface lg:w-auto"
              >
                <div className="flex flex-1 flex-col p-5">
                  <p className="flex items-center gap-3">
                    <span className="caps text-eyebrow text-accent-text">{step.index}</span>
                    <span aria-hidden className="h-px w-5 bg-accent/40" />
                  </p>

                  <h3 className="display-type mt-3 text-xl text-foreground">{step.name}</h3>

                  {/* `flex-1` pushes nothing — it lets the copy block absorb the
                      difference between a one-line and a two-line body so all
                      five illustrations start on the same line. */}
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>

                {art ? (
                  // A plain <img>: `images.loader` is custom with no resizer, so
                  // next/image would ship this exact file anyway, just heavier.
                  // Native width/height reserve the box and keep CLS at zero.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={art.src}
                    alt={step.alt}
                    width={art.width}
                    height={art.height}
                    loading="lazy"
                    decoding="async"
                    className="mt-auto block h-auto w-full"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
