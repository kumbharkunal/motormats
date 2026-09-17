'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOTION = { move: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' };

/**
 * The homepage's scroll motion, as four hooks.
 *
 * Two rules hold across all of them:
 *
 * **Content is visible without JavaScript.** Every reveal uses `gsap.from()`,
 * never a hidden initial state in CSS. If GSAP never loads, or a crawler reads
 * the server HTML, the page is complete and legible. A `data-reveal` element
 * with `opacity: 0` in the stylesheet would be invisible to both.
 *
 * **Plates move, pictures do not.** Parallax translates the frame rather than
 * the image inside it. Moving the image would need it scaled past its frame to
 * avoid exposing an edge, which would crop the photograph — the one thing the
 * frames exist to prevent.
 */

/** Staggered rise for every `[data-reveal]` descendant of `scope`. */
export function useEditorialReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current ?? undefined);
      if (targets.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION, (context) => {
        if (context.conditions?.still) return;

        // `batch` groups whatever enters together into one stagger, so a row of
        // plates cascades but a plate far down the page still animates on its
        // own — far cheaper than a trigger per element with a shared timeline.
        ScrollTrigger.batch(targets, {
          start: 'top 88%',
          onEnter: (batch) =>
            gsap.from(batch, {
              opacity: 0,
              y: 42,
              duration: 0.9,
              stagger: 0.09,
              ease: 'power3.out',
              overwrite: true,
            }),
        });
      });

      return () => mm.revert();
    },
    { scope },
  );
}

/**
 * Wipes every `[data-headline]` up from behind its own baseline.
 *
 * The clip is on a wrapper and the type moves inside it, so the headline
 * arrives from under a hard edge rather than fading in — on a page set in a
 * heavy uppercase face, a fade reads as a loading state and a wipe reads as
 * print. `overflow: hidden` comes from the utility on the wrapper, not from
 * JavaScript, so nothing is clipped if GSAP never runs.
 *
 * Separate from `useEditorialReveal` because the two have to be able to run on
 * the same section without the headline getting both treatments.
 */
export function useHeadlineReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>('[data-headline]', scope.current ?? undefined);
      if (lines.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION, (context) => {
        if (context.conditions?.still) return;

        lines.forEach((line) => {
          gsap.from(line, {
            yPercent: 108,
            duration: 1.05,
            ease: 'expo.out',
            scrollTrigger: { trigger: line, start: 'top 92%', once: true },
          });
        });
      });

      return () => mm.revert();
    },
    { scope },
  );
}

/**
 * Drifts every `[data-parallax]` frame at its own speed as the section passes.
 *
 * `data-parallax` carries the depth: `"1"` is subtle, `"3"` is pronounced.
 * Reading it off the element keeps the rhythm of a spread in the markup next to
 * the layout it belongs to, rather than in a lookup table here.
 */
export function useParallaxPlates(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const plates = gsap.utils.toArray<HTMLElement>('[data-parallax]', scope.current ?? undefined);
      if (plates.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION, (context) => {
        if (context.conditions?.still) return;

        plates.forEach((plate) => {
          const depth = Number(plate.dataset.parallax) || 1;

          gsap.fromTo(
            plate,
            { yPercent: depth * 5 },
            {
              yPercent: depth * -5,
              ease: 'none',
              scrollTrigger: {
                trigger: plate,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope },
  );
}

/**
 * Turns vertical scroll into horizontal travel across `track`, pinning
 * `section` for the duration.
 *
 * Only above the mobile breakpoint. Pinning a rail on a phone takes the page
 * away from a reader who is trying to scroll past it, so below 768px the rail
 * stays a native swipe scroller and this does nothing.
 */
export function useHorizontalRail(
  section: RefObject<HTMLElement | null>,
  track: RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ ...MOTION, wide: '(min-width: 768px)' }, (context) => {
        const { still, wide } = context.conditions ?? {};
        if (still || !wide) return;

        const el = track.current;
        const host = section.current;
        if (!el || !host) return;

        // Function form, so the distance is recomputed on resize rather than
        // frozen at the width the page happened to load at.
        const distance = () => Math.max(0, el.scrollWidth - host.clientWidth);
        if (distance() === 0) return;

        gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: host,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: section },
  );
}

/**
 * The cover's slow push-in, tied to scroll rather than to a loop.
 *
 * A looping Ken Burns keeps animating a picture nobody is looking at any more;
 * scrubbing it means the movement stops exactly when the cover leaves.
 */
export function useCoverScrub(
  section: RefObject<HTMLElement | null>,
  media: RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION, (context) => {
        if (context.conditions?.still) return;
        if (!media.current || !section.current) return;

        gsap.fromTo(
          media.current,
          { scale: 1, yPercent: 0 },
          {
            scale: 1.12,
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: section.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: section },
  );
}
