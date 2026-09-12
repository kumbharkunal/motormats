'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Ignore jitter and the rubber-band at the extremes of a Lenis-driven scroll. */
const DIRECTION_THRESHOLD = 8;

/**
 * The sticky band the header pills sit in.
 *
 * Two behaviours, both keyed off scroll:
 *
 * **Ground.** The homepage pulls its hero up under the header so the footage
 * reaches the top of the viewport, and the band has to stay unpainted for all of
 * it — a ground that faded in after a few pixels just laid a white strip across
 * the video. But the pills are the only things here with a background of their
 * own, so past the hero, content runs through the gaps between them and collides
 * with the nav. The switch is the hero's own bottom edge, published as
 * `[data-header-boundary]` rather than guessed from an offset.
 *
 * **Retraction.** Once past the hero the band slides away on scroll down and
 * comes back on scroll up, which is the only version of "hide the nav" that
 * leaves the site navigable — a header that hid for good would strand anyone
 * halfway down the page. It never retracts while over the hero, where it is
 * transparent anyway and moving it would just look like a glitch.
 *
 * Every other route passes `overlay={false}`: painted from the start, and it
 * still retracts, so the behaviour is consistent across the site.
 */
export function HeaderBand({
  overlay = false,
  children,
}: {
  overlay?: boolean;
  children: ReactNode;
}) {
  const [overHero, setOverHero] = useState(overlay);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const sync = () => {
      const y = window.scrollY;

      let isOverHero = false;
      if (overlay) {
        const boundary = document.querySelector<HTMLElement>('[data-header-boundary]');
        if (boundary) {
          const root = getComputedStyle(document.documentElement);
          const headerHeight =
            parseFloat(root.getPropertyValue('--header-height')) * parseFloat(root.fontSize);
          isOverHero = boundary.getBoundingClientRect().top > headerHeight;
        }
      }
      setOverHero(isOverHero);

      const delta = y - lastY.current;
      if (Math.abs(delta) > DIRECTION_THRESHOLD) {
        // Never retract over the hero, and never while near the top — otherwise
        // the band flickers away during the first few pixels of a page load.
        setHidden(!isOverHero && delta > 0 && y > 240);
        lastY.current = y;
      }
    };

    // Deferred a frame rather than run inline: the hero is still being laid out
    // when the effect fires, so measuring here reads a boundary that has not
    // settled yet.
    const first = requestAnimationFrame(sync);

    // Lenis scrolls the real document rather than transforming a wrapper, so
    // the ordinary scroll event is still the right signal.
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [overlay]);

  return (
    <header
      data-over-hero={overHero ? 'true' : 'false'}
      className={cn(
        'group/header sticky top-0 z-40 w-full shrink-0',
        'px-4 py-4 md:px-6 md:py-5',
        // `translate`, not `transform`. Tailwind v4 compiles `-translate-y-full`
        // to the standalone `translate` property rather than a `transform`
        // function, so transitioning `transform` animates nothing and the bar
        // snaps out of view. Both are still compositor properties.
        'transition-[translate,background-color] duration-500 ease-expo',
        'motion-reduce:transition-none',
        overHero ? 'bg-transparent' : 'bg-background/95',
        hidden && '-translate-y-full',
      )}
    >
      {children}
    </header>
  );
}
