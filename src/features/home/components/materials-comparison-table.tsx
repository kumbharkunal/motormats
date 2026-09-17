'use client';

import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { SectionIntro } from '@/components/editorial/section-intro';
import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { useEditorialReveal, useHeadlineReveal } from '@/hooks/use-scroll-motion';

const ROWS = [
  {
    aspect: 'Floorpan fit',
    generic: 'Universal sizes, trimmed at home',
    motormats: 'Laser-scanned pattern per make, model and year',
  },
  {
    aspect: 'Edge retention',
    generic: 'Curls and lifts at pedals within months',
    motormats: 'Bound edges and moulded lip hold shape for years',
  },
  {
    aspect: 'Water and grit',
    generic: 'Soaks through to carpet',
    motormats: 'Channelled tray or sealed core keeps spills on the mat',
  },
  {
    aspect: 'Backing grip',
    generic: 'Smooth rubber that slides under braking',
    motormats: 'MAXGRIP backing keyed to factory carpet',
  },
  {
    aspect: 'Clean-up',
    generic: 'Shampoo and dry time',
    motormats: 'Lift out, rinse, refit in minutes',
  },
  {
    aspect: 'Long-term look',
    generic: 'Fades and cracks in one to two seasons',
    motormats: 'UV-stable wear layer rated for daily Indian sun',
  },
] as const;

/**
 * Motormats against a generic set, as a table one column of which wins.
 *
 * Still a real `<table>` with row and column scopes — the comparison is the
 * page's densest piece of crawlable copy and the structure is what makes it
 * legible to a screen reader and to a search engine. Only the painting changed.
 *
 * What it used to be was three columns of equal weight under a headline with an
 * empty half beside it, which read as a spec sheet: true, and making no case.
 * The Motormats column now runs as a single raised plate the full height of the
 * table, capped in accent, so the answer is visible before a word is read — and
 * the intro takes the house `SectionIntro` shape, which puts the copy and the
 * call to action in the space that was empty.
 */
export function MaterialsComparisonTable() {
  const scope = useRef<HTMLElement>(null);

  useEditorialReveal(scope);
  useHeadlineReveal(scope);

  return (
    <section
      ref={scope}
      aria-labelledby="materials-compare-heading"
      className="screen-section band-light border-y border-border"
    >
      <div className="container-page py-section">
        <div data-reveal>
          <SectionIntro
            eyebrow="The difference"
            titleId="materials-compare-heading"
            title={
              <>
                Motormats vs
                <br />
                generic floor mats.
              </>
            }
            body="Same price bracket on paper, different story under your shoes — measured on the points that matter after the first monsoon."
            action={
              <Button asChild variant="flat" size="caps" shape="square">
                <Link href={SHOP_ROUTES.findYourFit}>Build your set</Link>
              </Button>
            }
          />
        </div>

        {/*
          Below `md` the table stops being a table.

          Sideways scrolling put the Motormats column — the only column making
          the argument — off the right edge of a phone, so the section showed a
          reader nothing but the mats it is arguing against. The rows collapse
          to stacked blocks instead: one render, driven by breakpoints, with the
          column names carried inline where the hidden `thead` used to say them.
        */}
        <div className="mt-8 md:mt-10">
          <table className="block w-full border-collapse text-left text-sm md:table">
            <caption className="sr-only">
              Comparison of Motormats custom-fit mats against generic universal mats
            </caption>

            {/* Fixed proportions. Left to itself the table gave the widest cell
                its natural width and opened a gutter down the middle. */}
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[36%]" />
              <col className="w-[42%]" />
            </colgroup>

            <thead className="hidden md:table-header-group">
              <tr>
                <th scope="col" className="py-4 pr-5 align-bottom text-eyebrow caps text-subtle-foreground">
                  What we measure
                </th>
                <th scope="col" className="py-4 pr-5 align-bottom text-eyebrow caps text-subtle-foreground">
                  Generic mats
                </th>
                <th
                  scope="col"
                  className="border-x border-t-2 border-t-accent border-x-border bg-surface px-5 py-4 align-bottom"
                >
                  <span className="display-type text-h3 text-accent">Motormats</span>
                </th>
              </tr>
            </thead>

            <tbody className="block md:table-row-group">
              {ROWS.map((row) => (
                <tr
                  key={row.aspect}
                  data-reveal
                  className="mb-4 block border-t border-border last:mb-0 md:mb-0 md:table-row md:border-t-0"
                >
                  <th
                    scope="row"
                    className="block pt-4 pb-2 text-left font-medium text-foreground md:table-cell md:border-t md:border-border md:py-4 md:pr-5 md:align-top"
                  >
                    {row.aspect}
                  </th>

                  <td className="block pb-2 text-muted-foreground md:table-cell md:border-t md:border-border md:py-4 md:pr-5 md:align-top">
                    <span className="flex gap-2.5">
                      <X aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-subtle-foreground" />
                      <span>
                        <span className="caps mb-0.5 block text-eyebrow text-subtle-foreground md:hidden">
                          Generic mats
                        </span>
                        {row.generic}
                      </span>
                    </span>
                  </td>

                  <td className="block border-l-2 border-l-accent bg-surface p-3 font-medium text-foreground md:table-cell md:border-x md:border-l-border md:border-x-border md:px-5 md:py-4 md:align-top">
                    <span className="flex gap-2.5">
                      <Check aria-hidden strokeWidth={2.5} className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span>
                        <span className="caps mb-0.5 block text-eyebrow text-accent md:hidden">
                          Motormats
                        </span>
                        {row.motormats}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}

              {/* Closes the plate on desktop. Without it the column's side rules
                  stop on the last row's baseline and the panel reads as
                  unfinished. Nothing to close once the rows are stacked. */}
              <tr aria-hidden className="hidden md:table-row">
                <td />
                <td />
                <td className="border-x border-t border-border bg-surface p-0" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
