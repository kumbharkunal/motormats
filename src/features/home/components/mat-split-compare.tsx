'use client';

import { MoveHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { canResizeLocalImages } from '@/lib/image-loader';
import { cn } from '@/lib/utils';

/**
 * One mat, two surfaces, split down the middle.
 *
 * This replaced a drawn top-down floorplan with four labelled wells. The
 * drawing explained *fit*, which the section next to it already argues in
 * words, and it could not show the one thing a photograph shows instantly:
 * that the left-hand option is moulded rubber and the right-hand one is woven
 * cloth. Nobody buys a mat because of a diagram of where it goes.
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

export function MatSplitCompare({ className }: { className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const committed = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const { left, width } = track.getBoundingClientRect();
    setSplit(Math.min(100, Math.max(0, ((clientX - left) / width) * 100)));
  }, []);

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      // For touch: don't prevent default yet — let the browser decide scroll vs drag
      if (event.pointerType === 'touch') {
        startPos.current = { x: event.clientX, y: event.clientY };
        committed.current = false;
        dragging.current = true;
        return;
      }
      // For mouse: capture immediately
      event.preventDefault();
      dragging.current = true;
      committed.current = true;
      trackRef.current?.setPointerCapture(event.pointerId);
      setFromClientX(event.clientX);
    },
    [setFromClientX],
  );

  const moveDrag = useCallback(
    (event: React.PointerEvent) => {
      if (!dragging.current) return;

      // For touch: check if movement is primarily horizontal before committing
      if (event.pointerType === 'touch' && !committed.current && startPos.current) {
        const dx = Math.abs(event.clientX - startPos.current.x);
        const dy = Math.abs(event.clientY - startPos.current.y);
        // Need at least 8px movement to decide
        if (dx < 8 && dy < 8) return;
        // If vertical movement dominates, cancel drag and let page scroll
        if (dy > dx) {
          dragging.current = false;
          startPos.current = null;
          return;
        }
        // Horizontal wins — capture pointer and commit to drag
        committed.current = true;
        event.preventDefault();
        trackRef.current?.setPointerCapture(event.pointerId);
      }

      if (committed.current) {
        event.preventDefault();
        setFromClientX(event.clientX);
      }
    },
    [setFromClientX],
  );

  const endDrag = useCallback((event: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    committed.current = false;
    startPos.current = null;
    trackRef.current?.releasePointerCapture(event.pointerId);
  }, []);

  return (
    <div className={cn('mx-auto w-full max-w-lg', className)}>
      <div
        ref={trackRef}
        className="relative aspect-[7/10] cursor-ew-resize select-none overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          dragging.current = false;
          committed.current = false;
          startPos.current = null;
        }}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split)}
        aria-label="Compare a generic rubber mat with a woven Motormats mat"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setSplit((previous) => Math.max(0, previous - 4));
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            setSplit((previous) => Math.min(100, previous + 4));
          }
        }}
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
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
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
          style={{ clipPath: `inset(0 0 0 ${split}%)` }}
        >
          {/* Right of centre, so the badge sits inside the woven half at the
              default 50% split instead of being bisected by the divider. */}
          <span className="absolute top-[63%] left-[64%] flex -translate-x-1/2 items-center bg-ink px-3 py-2">
            {/* `brand` sets MOTOR in white, which needs the ink plate behind
                it — which is what a real badge on a mat is anyway. */}
            <MotormatsLogo size="sm" tone="brand" className="!h-4 w-auto" />
          </span>
        </div>

        <div
          aria-hidden
          className="absolute inset-y-0 z-20 w-px bg-foreground/25"
          style={{ left: `${split}%` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${split}%` }}
        >
          <span className="grid size-10 place-items-center rounded-full bg-white text-foreground shadow-[0_2px_12px_rgba(0,0,0,0.16)]">
            <MoveHorizontal strokeWidth={1.75} className="size-4" />
          </span>
        </div>
      </div>

      <p className="caps mt-5 text-center text-eyebrow text-subtle-foreground">Drag to compare</p>
    </div>
  );
}
