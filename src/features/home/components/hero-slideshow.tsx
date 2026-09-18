'use client';

import { useCallback, useEffect, useState } from 'react';

import { HERO_SLIDES } from '@/features/home/hero-slides';
import { cn } from '@/lib/utils';

/**
 * The cover's rotating frames.
 *
 * **Each viewport gets a frame cut for it.** A desktop band is wide and a phone
 * band is tall, so every slide ships a 16:9 landscape and a 9:16 portrait and
 * `<picture>` picks — one element, one render, per the smoothness contract. The
 * frames then fill edge to edge with `object-cover` and nothing is letterboxed;
 * because each cut is already close to the shape of the box it lands in, cover
 * has almost nothing left to trim.
 *
 * **It can be stopped, and it stops itself.** The carousel this replaces ran on
 * a five-second timer with no dots, no pause and no way to advance it. This one
 * advances slowly, pauses on hover and on keyboard focus, and does not
 * auto-advance at all under `prefers-reduced-motion` — where a rotation nobody
 * asked for is exactly what the preference is about. The dots are real buttons.
 *
 * Only the first frame is eager: it is the LCP element, and it carries
 * `data-hero-image`, which is what the splash waits on before it leaves.
 */

/** Long enough to actually look at a photograph. */
const HOLD_MS = 6000;

/** The breakpoint the two cuts swap at, matching Tailwind's `md`. */
const WIDE_FROM = '(min-width: 768px)';

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);
  const [primed, setPrimed] = useState(false);

  /*
   * Give the first frame somewhere to zoom *from*.
   *
   * Slide zero is active on the very first render, so it was rendered already
   * wearing the end state — and a CSS transition only runs when a property
   * changes on an element that has already been painted with the previous
   * value. Every later slide animated, because each one is painted at rest
   * before it becomes active; the opening frame, the one every visitor sees,
   * was the only still image on the page.
   *
   * A frame's delay is all it takes: the browser paints slide zero at rest,
   * then this flips and the transform has a start and an end. It costs the
   * first slide one frame of its eight-second push, and nothing else moves.
   */
  useEffect(() => {
    const frame = requestAnimationFrame(() => setPrimed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (still || paused || HERO_SLIDES.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % HERO_SLIDES.length),
      HOLD_MS,
    );
    return () => window.clearInterval(timer);
  }, [still, paused]);

  const hold = useCallback(() => setPaused(true), []);
  const release = useCallback(() => setPaused(false), []);

  return (
    <div
      className="absolute inset-0"
      onPointerEnter={hold}
      onPointerLeave={release}
      onFocusCapture={hold}
      onBlurCapture={release}
    >
      {HERO_SLIDES.map((slide, slideIndex) => {
        const active = slideIndex === index;
        const first = slideIndex === 0;

        return (
          <div
            key={slide.slug}
            aria-hidden={!active}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-(--ease-smooth)',
              'motion-reduce:transition-none',
              active ? 'opacity-100' : 'opacity-0',
            )}
          >
            <picture>
              <source media={WIDE_FROM} srcSet={slide.wide.srcSet} sizes="100vw" />
              {/*
                Plain <img>, like `MatPlate`. `images.loader` is custom and has no
                resizer in front of `public/`, so every `next/image` on a local
                file ships the full-size original — native `srcSet` is the only
                thing here that actually serves a smaller file. Inside a
                <picture> the lint rule stands down on its own.
              */}
              <img
                {...(first ? { 'data-hero-image': true } : {})}
                src={slide.tall.src}
                srcSet={slide.tall.srcSet}
                sizes="100vw"
                alt={active ? slide.alt : ''}
                width={slide.tall.width}
                height={slide.tall.height}
                loading={first ? 'eager' : 'lazy'}
                fetchPriority={first ? 'high' : 'auto'}
                decoding="async"
                className={cn(
                  'h-full w-full object-cover',
                  // A slow push in, so a frame that holds for six seconds is not
                  // a still. It runs the full hold rather than the old 7s, so
                  // the larger travel is no faster per frame than the smaller one
                  // was — it just goes further, which is what makes it read.
                  // Transform only, and off entirely under reduced motion.
                  'transition-transform duration-[8000ms] ease-linear motion-reduce:transition-none',
                  active && primed ? 'scale-[1.14]' : 'scale-100',
                )}
              />
            </picture>
          </div>
        );
      })}

      {HERO_SLIDES.length > 1 ? (
        <div
          role="group"
          aria-label="Cover photographs"
          className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2.5 md:bottom-8"
        >
          {HERO_SLIDES.map((slide, slideIndex) => {
            const active = slideIndex === index;

            return (
              <button
                key={slide.slug}
                type="button"
                onClick={() => setIndex(slideIndex)}
                aria-label={`Show photograph ${slideIndex + 1} of ${HERO_SLIDES.length}`}
                aria-current={active ? 'true' : undefined}
                // 44px of target around a 2px mark: the rule is what you see,
                // the padding is what you press.
                className="group grid h-11 w-8 place-items-center"
              >
                <span
                  aria-hidden
                  className={cn(
                    'h-0.5 w-full origin-center transition-motion duration-500 ease-(--ease-expo)',
                    active
                      ? 'scale-x-100 bg-white'
                      : 'scale-x-75 bg-white/35 group-hover:bg-white/70',
                  )}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
