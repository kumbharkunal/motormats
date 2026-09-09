'use client';

import { usePrefersReducedMotion } from '@/hooks/use-media-query';
import { cloudinaryVideoUrl } from '@/lib/image-loader';

/**
 * Served from Cloudinary once the footage is uploaded and
 * NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER is set — edge-cached and transcoded per
 * browser instead of two fixed MP4s shipped from the app server on the LCP path.
 * The local files remain the fallback until then.
 */
const MOBILE_SRC = cloudinaryVideoUrl('hero-mobile', '/video/hero-mobile.mp4');
const DESKTOP_SRC = cloudinaryVideoUrl('hero-desktop', '/video/hero-desktop.mp4');

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
          {/* No `type`: with f_auto Cloudinary answers with WebM or MP4 depending
              on the browser, and asserting one would make it skip the source. */}
          <source src={MOBILE_SRC} media="(max-width: 767px)" />
          <source src={DESKTOP_SRC} />
        </video>
      )}

      {/* Scrim: keeps the headline legible over any frame of the footage. */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-background via-background/70 to-transparent" />
    </div>
  );
}
