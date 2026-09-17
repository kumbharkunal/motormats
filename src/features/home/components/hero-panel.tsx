'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { HeroCarousel } from '@/features/home/components/hero-carousel';
import { useCoverScrub } from '@/hooks/use-scroll-motion';

/** The spec row under the buttons. Three claims, no punctuation, no verbs. */
const SPECS = ['3D scanned', 'Precision cut', 'Made to order'];

/**
 * The cover.
 *
 * Type on ink at the left, photography bleeding off the right edge. The split
 * is 42/58 rather than half and half so the headline gets a measure wide enough
 * to set "YOUR FLOOR." on one line at every desktop width — the break between
 * the two sentences is the whole composition, and a headline that reflows to
 * three lines loses it.
 *
 * Below `lg` the panel collapses: the photograph becomes the full background
 * and the type sits on a scrim over it.
 */
export function HeroPanel() {
  const section = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useCoverScrub(section, media);

  return (
    <section
      ref={section}
      aria-labelledby="hero-heading"
      className="band-dark relative -mt-(--header-height) flex min-h-[100svh] items-end lg:items-center overflow-hidden"
    >
      {/*
        The picture starts at 28%, not at the 42% where the type column ends.
        The scrim fades out across 40–70%, so the photograph has to already be
        under that range — start it at the column edge and the fade runs out
        over flat ink instead, which shows as a hard vertical seam.
      */}
      <div ref={media} className="absolute inset-0 z-0 lg:left-[28%]">
        <HeroCarousel />
      </div>

      {/*
        Two scrims, because the type sits in a different place at each
        breakpoint. Stacked on mobile the copy is over the picture and needs a
        flat wash; split on desktop it is beside the picture and needs only a
        horizontal fade to carry the left edge of the photograph into the ink.
      */}
      <div aria-hidden className="absolute inset-0 z-1 bg-gradient-to-t from-ink via-ink/60 to-transparent lg:hidden" />
      <div
        aria-hidden
        className="absolute inset-0 z-1 hidden bg-gradient-to-r from-ink via-ink/85 via-40% to-transparent to-70% lg:block"
      />

      <div className="container-page relative z-10 w-full pt-(--header-height) pb-8 md:pb-20">
        {/* Headline, buttons, spec row. The eyebrow ("A better interior begins
            below") and the strapline under it were three separate pieces of
            copy saying the same thing before the reader reached a control. */}
        <div className="max-w-2xl motion-safe:animate-[fade-up_900ms_var(--ease-expo)_both] lg:max-w-[46%]">
          <h1 id="hero-heading" className="display-type text-display text-white">
            Your car.
            <br />
            Your floor.
          </h1>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="flat" size="caps" shape="square">
              <Link href={SHOP_ROUTES.findYourFit}>
                Find your fit <span aria-hidden>&rarr;</span>
              </Link>
            </Button>
            <Button asChild variant="hairline" size="caps" shape="square" className="text-white">
              <Link href={SHOP_ROUTES.collections}>Explore materials</Link>
            </Button>
          </div>

          <ul className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-3 md:mt-16">
            {SPECS.map((spec, i) => (
              <li key={spec} className="flex items-center gap-4">
                {/* Above `sm` only. The row wraps on a phone, and a rule that
                    belongs between two items ended up opening the second line. */}
                {i > 0 ? <span aria-hidden className="hidden h-3 w-px bg-white/25 sm:block" /> : null}
                <span className="caps text-eyebrow text-white/60">{spec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div aria-hidden data-header-boundary className="absolute inset-x-0 bottom-0 h-px" />
    </section>
  );
}
