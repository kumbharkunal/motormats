'use client';

import { usePrefersReducedMotion } from '@/hooks/use-media-query';

export function HeroBackdrop() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      <picture>
        <source media="(max-width: 767px)" srcSet="/video/hero-mobile-poster.webp" />
        <img
          src="/video/hero-desktop-poster.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="size-full object-cover object-center"
        />
      </picture>

      {prefersReducedMotion ? null : (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          poster="/video/hero-desktop-poster.webp"
          className="absolute inset-0 size-full object-cover object-center"
        >
          <source src="/video/hero-mobile.mp4" media="(max-width: 767px)" type="video/mp4" />
          <source src="/video/hero-desktop.mp4" type="video/mp4" />
        </video>
      )}

      {/* Scrim: keeps the headline legible over any frame of the footage. */}
      <div className="from-background via-background/70 absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t to-transparent" />
    </div>
  );
}
