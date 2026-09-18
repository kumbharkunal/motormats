'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

import { isDevelopment } from '@/lib/build-env';

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
/**
 * Controls whose hit testing a transformed ancestor genuinely breaks.
 *
 * Not every interactive element: a heading block with one link inside a reveal
 * is fine and extremely common. These are the ones where a gesture is measured
 * against a box, so a box that is painted somewhere other than where it is
 * hit-tested makes the control silently wrong.
 */
const GESTURE_CONTROLS = '[role="slider"], [role="radio"], input, select, textarea';

export function useEditorialReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const targets = gsap.utils
        .toArray<HTMLElement>('[data-reveal]', scope.current ?? undefined)
        // `data-no-reveal` opts a subtree out. The fit wizard uses it: for the
        // 900ms this tween runs, the wrapper carries a transform, and on iOS
        // Safari a transformed ancestor desynchronises a descendant's tap target
        // from where it is painted — so taps on the brand tiles landed nowhere.
        // `clearProps` fixes that at rest but not during the tween, and the only
        // reliable fix is for the transform never to exist.
        .filter((el) => !el.matches('[data-no-reveal]') && !el.querySelector('[data-no-reveal]'));

      if (targets.length === 0) return;

      // `data-reveal="fade"` opts a target into an opacity-only entrance. Any
      // band whose plates carry their own controls uses it: a transform, even a
      // finished one, is what puts a tap target out of step with its paint.
      const fading = targets.filter((el) => el.dataset.reveal === 'fade');
      const rising = targets.filter((el) => el.dataset.reveal !== 'fade');

      if (isDevelopment) {
        for (const el of rising) {
          if (!el.querySelector(GESTURE_CONTROLS)) continue;
          console.error(
            '[useEditorialReveal] a [data-reveal] wrapper contains a gesture control. ' +
              'Move data-reveal to the heading, or mark this subtree [data-no-reveal].',
            el,
          );
        }
      }

      const mm = gsap.matchMedia();

      mm.add({ ...MOTION, narrow: '(max-width: 767px)' }, (context) => {
        if (context.conditions?.still) return;
        // A 900ms rise starting at `top 88%` is still animating well after a
        // thumb has flicked past it, so the phone gets a shorter, shallower one.
        const narrow = Boolean(context.conditions?.narrow);

        // `batch` groups whatever enters together into one stagger, so a row of
        // plates cascades but a plate far down the page still animates on its
        // own — far cheaper than a trigger per element with a shared timeline.
        if (fading.length > 0) {
          ScrollTrigger.batch(fading, {
            start: 'top 88%',
            onEnter: (batch) =>
              gsap.from(batch, {
                opacity: 0,
                duration: narrow ? 0.5 : 0.7,
                stagger: narrow ? 0.05 : 0.08,
                ease: 'power2.out',
                overwrite: true,
                clearProps: 'opacity',
              }),
          });
        }

        if (rising.length === 0) return;

        ScrollTrigger.batch(rising, {
          start: 'top 88%',
          onEnter: (batch) =>
            gsap.from(batch, {
              opacity: 0,
              y: narrow ? 24 : 42,
              duration: narrow ? 0.6 : 0.9,
              stagger: narrow ? 0.06 : 0.09,
              ease: 'power3.out',
              overwrite: true,
              // Without this GSAP leaves `transform: translate(0px, 0px)` on the
              // wrapper for the life of the page. A settled reveal has no reason
              // to keep a transform, and an idle one here is not free: it makes
              // the wrapper a composited layer and a containing block, which is
              // what puts the tap target of a control inside it out of step with
              // where it is painted on iOS Safari. The fit wizard's brand grid
              // sits under one of these.
              clearProps: 'transform,translate,rotate,scale,opacity',
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
            clearProps: 'transform,translate,rotate,scale',
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

export function useHeroIntro(section: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION, (context) => {
        if (context.conditions?.still) return;

        const scope = section.current;
        if (!scope) return;

        const lines = gsap.utils.toArray<HTMLElement>('[data-hero-line]', scope);
        const items = gsap.utils.toArray<HTMLElement>('[data-hero-item]', scope);
        if (lines.length === 0 && items.length === 0) return;

        // Held back rather than hidden with CSS: without JS the cover is simply
        // legible, which is the same rule the rest of the page follows.
        gsap.set(lines, { yPercent: 106 });
        gsap.set(items, { opacity: 0, y: 18 });

        let played = false;
        const play = () => {
          if (played) return;
          played = true;

          gsap
            .timeline()
            .to(lines, {
              yPercent: 0,
              duration: 0.7,
              stagger: 0.06,
              ease: 'expo.out',
              clearProps: 'transform,translate',
            })
            .to(
              items,
              {
                opacity: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.06,
                ease: 'power3.out',
                clearProps: 'transform,translate,opacity',
              },
              '-=0.45',
            );
        };

        /*
         * Present is not the same as showing.
         *
         * The splash is never removed from the DOM — it is server-rendered
         * inside the React tree and taking the node out would break hydration —
         * so it is retired with `display: none` and stays queryable forever.
         * Testing for the element alone therefore meant that on every repeat
         * visit in a session, where the splash never paints at all, the cover
         * copy sat invisible waiting for an event that was never going to fire,
         * until the failsafe released it nearly two seconds later.
         *
         * The computed style answers the real question, and covers every way it
         * gets hidden — the session flag on the root, the finished state, or a
         * reduced-motion preference — with one check.
         */
        const splash = document.getElementById('app-splash');
        const splashIsShowing =
          splash !== null && window.getComputedStyle(splash).display !== 'none';

        if (!splashIsShowing) {
          play();
          return () => undefined;
        }

        document.addEventListener('motormats:splash-done', play, { once: true });
        // The splash caps itself at 1200ms and takes 280ms to leave; this is the
        // backstop for the case where it goes without announcing it.
        const failsafe = gsap.delayedCall(1.6, play);

        return () => {
          document.removeEventListener('motormats:splash-done', play);
          failsafe.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: section },
  );
}

export function useCoverScrub(
  section: RefObject<HTMLElement | null>,
  media: RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ ...MOTION, narrow: '(max-width: 767px)' }, (context) => {
        if (context.conditions?.still) return;
        if (!media.current || !section.current) return;

        // A full-bleed cover scaling on every scroll frame is the most
        // expensive thing on the page for a mid-range phone, so it moves less
        // there — the effect survives, the compositing cost does not.
        const narrow = Boolean(context.conditions?.narrow);

        gsap.fromTo(
          media.current,
          { scale: 1, yPercent: 0 },
          {
            scale: narrow ? 1.06 : 1.12,
            yPercent: narrow ? 3 : 6,
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
