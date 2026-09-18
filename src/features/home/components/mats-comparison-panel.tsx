'use client';

import { Check, X } from 'lucide-react';
import { useRef } from 'react';

import { MatSplitCompare } from '@/features/home/components/mat-split-compare';
import { useEditorialReveal } from '@/hooks/use-scroll-motion';

const GENERIC = [
  'One size fits many',
  'Shifts and bunches',
  'Wears out quickly',
  'Looks out of place',
];

const MOTORMATS = ['Exact vehicle fit', 'Stays in place', 'Built to last', 'Looks like it belongs'];

/**
 * The before and after, either side of the thing being compared.
 *
 * Three columns rather than two stacked lists, so the claim and its rebuttal
 * sit on the same line as each other across the floorplan — the reader's eye
 * crosses the drawing to get from "shifts and bunches" to "stays in place".
 * Below `lg` the columns stack under the drawing, generic first, because the
 * order of the argument still has to hold.
 */
export function MatsComparisonPanel() {
  const scope = useRef<HTMLElement>(null);
  useEditorialReveal(scope);

  return (
    <section
      ref={scope}
      aria-labelledby="compare-heading"
      className="screen-section band-light border-b border-border"
    >
      <h2 id="compare-heading" className="sr-only">
        Generic mats compared with Motormats
      </h2>

      <div className="container-page py-section">
        {/* Capped, unlike the bands either side of it. The page column is the
            full sheet now, and at that width a 500px mat in the middle left
            the two claim lists pinned to the screen edges with no visual
            connection to the thing they are describing. */}
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-10">
          <ClaimList
            eyebrow="Before"
            title="Generic mat"
            items={GENERIC}
            tone="negative"
            className="lg:order-1"
          />

          {/* Not `data-reveal`: it holds a slider, and a transformed ancestor puts
              a gesture control out of step with where it is painted. */}
          <div data-no-reveal className="lg:order-2">
            <MatSplitCompare />
          </div>

          <ClaimList
            eyebrow="After"
            title="Motormats"
            items={MOTORMATS}
            tone="positive"
            className="lg:order-3 lg:text-right"
          />
        </div>

        <p
          data-reveal
          className="caps mt-12 text-center text-eyebrow text-muted-foreground"
        >
          Same car. A far more interesting floor.
        </p>
      </div>
    </section>
  );
}

function ClaimList({
  eyebrow,
  title,
  items,
  tone,
  className,
}: {
  eyebrow: string;
  title: string;
  items: string[];
  tone: 'negative' | 'positive';
  className?: string;
}) {
  const Icon = tone === 'positive' ? Check : X;

  return (
    <div data-reveal className={className}>
      <p
        className={`caps text-eyebrow ${tone === 'positive' ? 'text-accent-text' : 'text-subtle-foreground'}`}
      >
        {eyebrow}
      </p>
      <h3 className="display-type mt-4 text-h3 text-foreground">{title}</h3>

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={`flex items-center gap-3 text-sm text-muted-foreground ${
              tone === 'positive' ? 'lg:flex-row-reverse' : ''
            }`}
          >
            <Icon
              aria-hidden
              strokeWidth={2}
              className={`size-3.5 shrink-0 ${tone === 'positive' ? 'text-accent-text' : 'text-subtle-foreground'}`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
