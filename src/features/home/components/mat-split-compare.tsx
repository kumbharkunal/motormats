'use client';

import { MoveHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { useDragValue } from '@/hooks/use-drag-value';
import { canResizeLocalImages } from '@/lib/image-loader';
import { cn } from '@/lib/utils';

/**
 * One mat, two surfaces, split down the middle.
 *
 * Both layers are the same silhouette at the same pixel size, cut once in
 * `scripts/build-mat-compare.mjs`, so `object-contain` lands them on exactly
 * the same outline and the handle changes the surface without the shape
 * shifting underneath it. Two separately photographed mats would never line up,
 * and the wipe would read as a glitch rather than a swap.
 *
 * The woven side is the base layer and the rubber is clipped over it from the
 * left, which is the order the argument is written in: before on the left,
 * after on the right.
 *
 * The gesture lives in `useDragValue`. What matters here is that the split is a
 * CSS custom property rather than React state — every layer below reads
 * `var(--split)`, so a drag repaints on the compositor and never re-renders the
 * two full-bleed images.
 */
const MATS = {
  generic: {
    src: '/compare/mat-generic.webp',
    alt: 'A generic moulded rubber car mat',
  },
  motormats: {
    src: '/compare/mat-motormats.webp',
    alt: 'The same mat in a woven Motormats topsheet with a bound edge',
  },
} as const;

const LAYER = 'object-contain p-5 md:p-7';
const SIZES = '(max-width: 1023px) 80vw, 34vw';

/**
 * The one-shot hint: a full sweep, right then left, then back to centre.
 *
 * Opening one way and closing again reads as a wobble — it shows the seam moves
 * without showing that it moves *both* ways, which is the whole proposition. Far
 * enough each way to reveal a decent run of each surface, and slow enough to
 * follow; `animateTo` carries each leg on the CSS transition already registered
 * for `--split`, so this costs no JS per frame.
 */
const HINT_STOPS: readonly { to: number; at: number; over: number }[] = [
  { to: 76, at: 340, over: 700 },
  { to: 24, at: 1140, over: 900 },
  { to: 50, at: 2140, over: 600 },
];

export function MatSplitCompare({ className }: { className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // Stable identity: `useDragValue` memoises on this, and an inline arrow would
  // rebuild its painter — and re-run its commit effect — on every render.
  const formatValue = useCallback((value: number) => `${Math.round(value)}% Motormats`, []);

  const { isDragging, animateTo, handleProps, trackProps } = useDragValue({
    trackRef,
    handleRef,
    label: 'Compare a generic rubber mat with a woven Motormats mat',
    formatValue,
  });

  const hintTimers = useRef<number[]>([]);
  const hinted = useRef(false);

  const cancelHint = useCallback(() => {
    hinted.current = true;
    for (const timer of hintTimers.current) window.clearTimeout(timer);
    hintTimers.current = [];
  }, []);

  /**
   * Sweep the split once, on first sight, and leave it centred.
   *
   * A static seam reads as a join in the artwork rather than a control, and the
   * caption underneath is doing all the work of explaining it. Showing the
   * control travel both ways costs nothing and replaces the instruction.
   *
   * `threshold` is deliberately low. The plate is 7:10, so on a phone it is
   * taller than the space left under the header and *cannot* ever be 60% visible
   * — the old threshold meant the hint never fired on the device that needs it
   * most. A third of it on screen is plenty to watch the seam move.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (hinted.current || !entries.some((entry) => entry.isIntersecting)) return;
        hinted.current = true;
        observer.disconnect();
        for (const stop of HINT_STOPS) {
          // Each leg finishes before the next starts, so the seam glides through
          // the sweep instead of snapping between three positions.
          hintTimers.current.push(window.setTimeout(() => animateTo(stop.to, stop.over), stop.at));
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(track);
    return () => {
      observer.disconnect();
      for (const timer of hintTimers.current) window.clearTimeout(timer);
    };
  }, [animateTo]);

  // The reader taking hold of the control outranks the hint that was explaining
  // it, so the first press cancels whatever the hint still had scheduled.
  const onTrackPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    cancelHint();
    trackProps.onPointerDown(event);
  };

  const onHandlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    cancelHint();
    handleProps.onPointerDown(event);
  };

  return (
    <div className={cn('mx-auto w-full max-w-lg', className)}>
      <div
        ref={trackRef}
        data-split-track
        className="relative aspect-[7/10] cursor-ew-resize select-none overflow-hidden"
        // The track leaves the vertical axis to the page. The handle does not —
        // see `useDragValue`.
        style={{ touchAction: 'pan-y' }}
        {...trackProps}
        onPointerDown={onTrackPointerDown}
      >
        <Image
          src={MATS.motormats.src}
          alt={MATS.motormats.alt}
          fill
          sizes={SIZES}
          quality={88}
          unoptimized={!canResizeLocalImages}
          className={LAYER}
        />

        {/* `inset()` rather than two half-width frames: clipping keeps one
            full-size image per layer, so neither side rescales as it moves. */}
        <div
          className="absolute inset-0"
          style={{ clipPath: 'inset(0 calc(100% - var(--split)) 0 0)' }}
        >
          <Image
            src={MATS.generic.src}
            alt={MATS.generic.alt}
            fill
            sizes={SIZES}
            quality={88}
            unoptimized={!canResizeLocalImages}
            className={LAYER}
          />
        </div>

        {/* The badge belongs to the woven mat, so it is clipped to that side. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: 'inset(0 0 0 var(--split))' }}
        >
          {/* Right of centre, so the badge sits inside the woven half at the
              default split instead of being bisected by the divider. */}
          {/* Not the site lockup: this is the black rubber badge stitched onto
              a real mat, lying on a photograph of one. The plate is the object. */}
          <span className="absolute top-[63%] left-[64%] flex -translate-x-1/2 items-center bg-ink px-3 py-2">
            <MotormatsLogo size="sm" className="!h-4" />
          </span>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-20 w-px bg-foreground/25"
          style={{ left: 'var(--split)' }}
        />

        {/*
          A real control, not a decoration. The old handle was
          `pointer-events-none` over a 40px disc, so the one thing that looked
          grabbable was the one thing you could not grab; `after:-inset-2`
          widens the target to roughly 60px without moving the artwork.
        */}
        <div
          ref={handleRef}
          {...handleProps}
          onPointerDown={onHandlePointerDown}
          style={{ ...handleProps.style, left: 'var(--split)' }}
          className={cn(
            'absolute top-1/2 z-30 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center',
            'rounded-full bg-white text-foreground shadow-[0_2px_12px_rgba(0,0,0,0.16)]',
            'transition-motion duration-200 ease-out',
            "after:absolute after:-inset-2 after:content-['']",
            isDragging ? 'scale-95' : 'hover:scale-105',
          )}
        >
          <MoveHorizontal aria-hidden strokeWidth={1.75} className="size-4" />
        </div>
      </div>

      <p className="caps mt-5 text-center text-eyebrow text-subtle-foreground">Drag to compare</p>
    </div>
  );
}
