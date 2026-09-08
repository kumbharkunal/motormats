import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/**
 * Server component — the whole scene is CSS, so this page ships no JavaScript
 * and stays smooth on low-end phones.
 *
 * The road is two clip-path wedges (surface + centre line) rather than a 3D
 * rotateX plane: it gives the same recession without a perspective layer, and
 * only the dash gradient animates.
 */
export default function NotFound() {
  return (
    <main
      id="main"
      className="relative grid min-h-svh place-items-center overflow-hidden px-6 py-24 short:py-8"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Road surface */}
        <div
          className="absolute inset-x-0 bottom-0 h-[62%]"
          style={{
            clipPath: 'polygon(47.5% 0%, 52.5% 0%, 96% 100%, 4% 100%)',
            backgroundImage:
              'linear-gradient(to top, rgba(255,255,255,0.05), rgba(255,255,255,0.01) 55%, transparent)',
          }}
        />
        {/* Dashed centre line, clipped to a narrower wedge so the dashes widen
            toward the viewer. */}
        <div
          className="absolute inset-x-0 bottom-0 h-[62%] overflow-hidden"
          style={{ clipPath: 'polygon(49.7% 0%, 50.3% 0%, 54% 100%, 46% 100%)' }}
        >
          <div
            className="absolute inset-x-0 -top-1/4 h-[150%] animate-[road-scroll_1.6s_linear_infinite] motion-reduce:animate-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, rgba(255,255,255,0.30) 0 4%, transparent 4% 11%)',
              maskImage: 'linear-gradient(to bottom, transparent 6%, black 60%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 6%, black 60%)',
            }}
          />
        </div>
        {/* Horizon glow */}
        <div className="bg-accent/15 absolute top-[38%] left-1/2 h-56 w-[34rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
        {/* Keeps the copy legible over the road without hiding it */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 55% 40% at 50% 42%, rgba(10,10,11,0.95) 40%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <span
          aria-hidden
          className="font-display text-foreground/[0.03] pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-[58%] leading-none font-bold tracking-tighter select-none [font-size:clamp(11rem,38vw,24rem)] short:[font-size:clamp(7rem,26vh,12rem)]"
        >
          404
        </span>

        <p className="text-accent-text mb-5 text-xs font-semibold tracking-[0.25em] uppercase short:mb-2">
          Error 404
        </p>

        <h1 className="text-display text-gradient short:text-h2">Wrong turn</h1>

        <p className="text-body text-muted-foreground mt-5 max-w-md text-balance short:mt-3 short:text-sm">
          This page isn&apos;t on the map. It may have moved, or the link was mistyped.
        </p>

        <div className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row short:mt-5">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
