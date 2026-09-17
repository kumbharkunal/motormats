'use client';

import { useEffect, useState } from 'react';

import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { LOADER_QUOTES } from '@/components/feedback/loader-quotes';
import { cn } from '@/lib/utils';

export type BrandedLoaderProps = {
  className?: string;
  /** Screen-covering overlay (splash + route changes). */
  overlay?: boolean;
  /** Cycle mat/car quotes under the logo. */
  rotateQuotes?: boolean;
  label?: string;
};

export function BrandedLoader({
  className,
  overlay = false,
  rotateQuotes = true,
  label = 'Loading',
}: BrandedLoaderProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    if (!rotateQuotes) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let fadeTimer: number | undefined;
    const interval = window.setInterval(() => {
      setQuoteVisible(false);
      fadeTimer = window.setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % LOADER_QUOTES.length);
        setQuoteVisible(true);
      }, 220);
    }, 3200);
    return () => {
      window.clearInterval(interval);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, [rotateQuotes]);

  const quote = LOADER_QUOTES[quoteIndex];

  const panel = (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex flex-col items-center justify-center gap-8 px-6 py-10 text-center',
        overlay ? 'min-h-full w-full' : 'min-h-[50vh] w-full',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-5">
        <MotormatsLogo size="md" tone="brand" className="!h-9 w-auto sm:!h-10" />
        <div className="h-0.5 w-28 overflow-hidden rounded-full bg-white/15 sm:w-36">
          <div className="h-full w-1/2 animate-[loader-sweep_0.9s_ease-in-out_infinite] rounded-full bg-accent" />
        </div>
      </div>

      {rotateQuotes ? (
        <figure className="mx-auto max-w-md">
          <blockquote
            className={cn(
              'text-[0.9375rem] leading-relaxed font-medium text-white/85 transition-opacity duration-300 sm:text-base',
              quoteVisible ? 'opacity-100' : 'opacity-0',
            )}
          >
            &ldquo;{quote}&rdquo;
          </blockquote>
          <figcaption className="mt-4 text-[0.6875rem] font-semibold tracking-[0.2em] text-white/45 uppercase">
            Motormats
          </figcaption>
        </figure>
      ) : (
        <p className="text-[0.6875rem] font-semibold tracking-[0.24em] text-white/60 uppercase">{label}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-[280] flex items-center justify-center bg-foreground/35 backdrop-blur-md',
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
    <div className="bg-foreground text-white" aria-busy="true">
      {panel}
    </div>
  );
}
