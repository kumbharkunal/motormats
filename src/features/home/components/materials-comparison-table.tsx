'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { useEditorialReveal } from '@/hooks/use-scroll-motion';

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

/** Section 3: Motormats vs generic mats — crawlable table for SEO and quick scanning. */
export function MaterialsComparisonTable() {
  const scope = useRef<HTMLElement>(null);

  useEditorialReveal(scope);

  return (
    <section
      ref={scope}
      aria-labelledby="materials-compare-heading"
      className="band-light border-y border-border"
    >
      <div className="container-page py-section">
        <div className="max-w-2xl">
          <h2 id="materials-compare-heading" data-reveal className="display-type text-h2 text-foreground">
            Motormats vs generic floor mats
          </h2>
          <p data-reveal className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Same price bracket on paper, different story under your shoes. Here is how a custom set
            compares on the points that matter after the first monsoon.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto md:mt-14">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Comparison of Motormats custom-fit mats against generic universal mats
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-4 pr-4 font-semibold text-foreground">
                  What we measure
                </th>
                <th scope="col" className="px-4 py-4 font-semibold text-muted-foreground">
                  Generic mats
                </th>
                <th scope="col" className="py-4 pl-4 font-semibold text-accent">
                  Motormats
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.aspect} data-reveal className="border-b border-border/80 last:border-0">
                  <th scope="row" className="py-4 pr-4 align-top font-medium text-foreground">
                    {row.aspect}
                  </th>
                  <td className="px-4 py-4 align-top text-muted-foreground">{row.generic}</td>
                  <td className="py-4 pl-4 align-top font-medium text-foreground">{row.motormats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div data-reveal className="mt-10 flex justify-center md:mt-12">
          <Button asChild variant="flat" size="caps" shape="square">
            <Link href={SHOP_ROUTES.findYourFit}>Build your set</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
