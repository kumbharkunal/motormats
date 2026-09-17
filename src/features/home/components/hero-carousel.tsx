'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { HERO_BANNERS } from '@/features/home/photo-assets';
import { canResizeLocalImages } from '@/lib/image-loader';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

const HOLD_MS = 5200;
/** Matches the opacity transition below, so the drift and the fade end together. */
const FADE_MS = 1400;

/**
 * The cover's fading banner run.
 *
 * Every frame stays mounted and the active one is brought to full opacity, so a
 * crossfade never has to mount and decode an image mid-transition — the cause
 * of the flash-to-black the mounting approach gives on a slow connection. Only
 * the first frame is `priority`; the rest are ordinary lazy images that have
 * several seconds of runway before they are needed.
 *
 * The slow push-in is on the active frame only, which means a photograph that
 * has faded out is not still being animated off-screen.
 */
export function HeroCarousel() {
  const reduce = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_BANNERS.length);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
  }, [reduce]);

  return (
    <>
      {HERO_BANNERS.map((photo, i) => {
        const active = i === index;
        return (
          <div
            key={photo.src}
            aria-hidden={!active}
            className="absolute inset-0 transition-opacity ease-(--ease-smooth)"
            style={{ opacity: active ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
          >
            <Image
              src={photo.src}
              alt={i === 0 ? photo.alt : ''}
              fill
              sizes="(max-width: 1023px) 100vw, 60vw"
              quality={90}
              priority={i === 0}
              unoptimized={!canResizeLocalImages}
              className="object-cover object-center transition-transform ease-linear motion-reduce:transition-none"
              style={{
                transitionDuration: `${HOLD_MS + FADE_MS}ms`,
                scale: active && !reduce ? 1.06 : 1,
              }}
            />
          </div>
        );
      })}

      <p className="absolute right-5 bottom-5 z-10 caps text-eyebrow text-white/55 tabular-nums md:right-8 md:bottom-8">
        {String(index + 1).padStart(2, '0')}
        <span className="mx-1.5 text-white/30">/</span>
        {String(HERO_BANNERS.length).padStart(2, '0')}
      </p>
    </>
  );
}
