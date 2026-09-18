'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { HeroSlideshow } from '@/features/home/components/hero-slideshow';
import { useCoverScrub, useHeroIntro } from '@/hooks/use-scroll-motion';

/** The spec row under the buttons. Three claims, no punctuation, no verbs. */
const SPECS = ['3D scanned', 'Precision cut', 'Made to order'];

/**
 * The cover.
 *
 * **Five frames, each cut for the band it lands in.** The rotation, and the
 * reason a phone and a desktop are served differently shaped crops of the same
 * photograph, both live in `HeroSlideshow`. Only the first frame is eager, so
 * the largest contentful paint still costs one image rather than five.
 *
 * **It sits below the header, not under it.** The band is opaque paper on every
 * route now, so a cover running beneath it would be hidden by it rather than
 * showing through. `screen-section` gives it exactly what is left of the screen.
 */
export function HeroPanel() {
  const section = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useHeroIntro(section);
  useCoverScrub(section, media);

  return (
    <section
      ref={section}
      aria-labelledby="hero-heading"
      /*
        Bottom-left at every width.

        It used to centre vertically on desktop, which left the headline floating
        in the middle of the left edge with the subject of the photograph below
        it — two centres of attention, neither winning. Low and left puts the
        type on the ground plane of all five frames (the dune, the sand, the
        car's flank, the railing) rather than in their sky, which is both the
        better composition and the more legible one: the scrim has to work
        hardest exactly where the picture is already darkest.
      */
      className="band-dark screen-section relative items-stretch justify-end overflow-hidden"
    >
      <div ref={media} className="absolute inset-0 z-0">
        <HeroSlideshow />
      </div>

      {/*
        Two scrims, crossed rather than swapped.

        The copy now sits bottom-left at every width, so both washes are wanted
        at once and each only has to do half the work: the vertical one anchors
        the type to the bottom edge, the horizontal one weights the left. Neither
        is heavy enough alone to flatten the picture, and where they overlap —
        the bottom-left corner, which is the only place white type ever lands —
        they are more than enough. The horizontal one stays off below `lg`, where
        the copy runs the full width and a side wash would just dim the frame.
      */}
      <div
        aria-hidden
        className="absolute inset-0 z-1 bg-gradient-to-t from-ink via-ink/65 via-32% to-transparent to-72%"
      />
      <div
        aria-hidden
        className="absolute inset-0 z-1 hidden bg-gradient-to-r from-ink/80 via-ink/35 via-28% to-transparent to-60% lg:block"
      />

      <div className="container-page relative z-10 w-full pb-20 md:pb-28">
        <div className="max-w-2xl lg:max-w-[48%]">
          <h1 id="hero-heading" className="display-type text-display text-white">
            {/* Each line clips its own rise. The wrapper is the mask; the hook
                only has to move what is inside it. */}
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-hero-line className="block">
                Your car.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-hero-line className="block">
                Your floor.
              </span>
            </span>
          </h1>

          <div data-hero-item className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
            <Button asChild variant="flat" size="caps" shape="square">
              <Link href={SHOP_ROUTES.findYourFit}>
                Find your fit <span aria-hidden>&rarr;</span>
              </Link>
            </Button>
            <Button asChild variant="hairline" size="caps" shape="square" className="text-white">
              <Link href={SHOP_ROUTES.collections}>Explore materials</Link>
            </Button>
          </div>

          <ul
            data-hero-item
            className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 short:mt-6 md:mt-14"
          >
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
    </section>
  );
}
