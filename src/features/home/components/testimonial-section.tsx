'use client';

import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';

const QUOTES = [
  { quote: 'Perfect fit. Looks factory-finished.', author: 'A Motormats customer', car: 'Hyundai Creta' },
  { quote: 'First set that has not shifted under the pedals.', author: 'A Motormats customer', car: 'Tata Nexon' },
  { quote: 'Came out of the monsoon looking new.', author: 'A Motormats customer', car: 'Mahindra Thar' },
  { quote: 'The weave is the part photos do not show.', author: 'A Motormats customer', car: 'Honda City' },
];

const RATING = 4.8;
const REVIEWS = 500;

/**
 * One quote at a time, stepped by hand.
 *
 * No autoplay. A testimonial that moves on its own takes the sentence away
 * mid-read, and unlike the cover — where the photograph is ambient — this band
 * is the one place on the page a reader is reading rather than looking.
 *
 * The quote is set in the UI face, not the display cut. It is the only voice on
 * the page that is not Motormats speaking, and the change of face is what says
 * so without a label.
 */
export function TestimonialSection() {
  const [index, setIndex] = useState(0);
  const current = QUOTES[index]!;

  const step = (delta: number) =>
    setIndex((i) => (i + delta + QUOTES.length) % QUOTES.length);

  return (
    <section aria-labelledby="testimonial-heading" className="screen-section band-light border-b border-border">
      <div className="container-page py-band">
        <p id="testimonial-heading" className="caps text-eyebrow text-subtle-foreground">
          What drivers say
        </p>

        <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-center">
          <figure className="lg:col-span-7">
            <blockquote
              aria-live="polite"
              className="text-[clamp(1.5rem,3.4vw+0.5rem,3.25rem)] leading-[1.15] font-medium tracking-[-0.02em] text-balance text-foreground"
            >
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 text-xs text-muted-foreground">
              &mdash; {current.author}, {current.car}
            </figcaption>
          </figure>

          <div className="flex items-center justify-between gap-8 lg:col-span-5 lg:justify-end lg:gap-12">
            <div>
              <p className="flex items-center gap-2">
                <span className="display-type text-sm text-foreground tabular-nums">{RATING}</span>
                <span className="flex gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-3.5 fill-foreground text-foreground" />
                  ))}
                </span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                from {REVIEWS}+ verified customers
              </p>
            </div>

            <div className="flex gap-2">
              <StepButton label="Previous quote" onClick={() => step(-1)}>
                <ChevronLeft aria-hidden strokeWidth={1.75} className="size-4" />
              </StepButton>
              <StepButton label="Next quote" onClick={() => step(1)}>
                <ChevronRight aria-hidden strokeWidth={1.75} className="size-4" />
              </StepButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full border border-border bg-surface text-foreground transition-colors duration-300 hover:border-foreground"
    >
      {children}
    </button>
  );
}
