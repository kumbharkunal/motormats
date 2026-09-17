'use client';

import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   Brand mark — the two parallelogram bars from icon.svg.

   For the stroke-draw reveal we need CLOSED paths (the originals are open and
   only work as fills). These retrace the same parallelogram outlines so that
   `stroke-dasharray` + `stroke-dashoffset` can animate them.
   ───────────────────────────────────────────────────────────────────────────── */

/** Closed-path versions of the two slanted bars for stroke-draw animation. */
const BAR_A = 'M66 23V70L120 122V72L66 23Z';
const BAR_B = 'M28 43V91L76 137V87L28 43Z';

/**
 * Approximate perimeter of each parallelogram path. Used as the initial
 * `stroke-dasharray` and `stroke-dashoffset` so the draw animation travels the
 * full outline. A generous overestimate is harmless — an underestimate leaves a
 * visible stub at the start.
 */
const PATH_LEN = 320;

export type BrandedLoaderProps = {
  className?: string;
  /** Screen-covering overlay (splash + route changes). */
  overlay?: boolean;
  /** Kept for backward compat — previously controlled quote rotation. Now a no-op. */
  rotateQuotes?: boolean;
  label?: string;
};

export function BrandedLoader({
  className,
  overlay = false,
  // rotateQuotes kept in signature for backward compat, but unused
  label = 'Loading',
}: BrandedLoaderProps) {

  const panel = (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex items-center justify-center px-6 py-10',
        overlay ? 'min-h-full w-full' : 'min-h-[50vh] w-full',
        className,
      )}
    >
      {/* ── Brand mark only: stroke-draw → fill reveal ────────────────── */}
      <svg
        aria-hidden
        viewBox="0 0 148 160"
        className="h-20 w-auto sm:h-24"
      >
        {/* Ghost silhouette — very faint static fill so the mark is always hinted */}
        <g opacity="0.06">
          <path d={BAR_A} fill="#e10600" />
          <path d={BAR_B} fill="#e10600" />
        </g>

        {/* Stroke-draw layer — each bar draws its outline, then fills */}
        {[BAR_A, BAR_B].map((d, i) => (
          <path
            key={d}
            d={d}
            fill="#e10600"
            stroke="#e10600"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{
              '--path-len': `${PATH_LEN}`,
              strokeDasharray: PATH_LEN,
              strokeDashoffset: PATH_LEN,
              fillOpacity: 0,
              animation: [
                `mark-draw 700ms ${250 + i * 200}ms var(--ease-quart) forwards`,
                `mark-fill 400ms ${800 + i * 150}ms ease-out forwards`,
              ].join(', '),
            } as React.CSSProperties}
            className="motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:[fill-opacity:1] motion-reduce:[stroke-dashoffset:0]"
          />
        ))}
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );

  if (overlay) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-[280] flex items-center justify-center bg-[#0a0a0a]',
          'supports-[height:100dvh]:min-h-[100dvh] min-h-svh',
          'motion-reduce:static motion-reduce:min-h-[50vh]',
        )}
        aria-busy="true"
      >
        {panel}
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] text-white" aria-busy="true">
      {panel}
    </div>
  );
}
