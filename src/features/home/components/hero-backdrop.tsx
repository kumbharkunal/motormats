'use client';

import { useEffect, useRef } from 'react';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  /*
   * The deck used to start and stop this from its own transition handler. On a
   * scrolling page nothing owns that, so the video minds itself: it plays while
   * the hero is on screen and pauses once it is not, because decoding frames
   * nobody can see costs battery for nothing.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.1 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      <picture>
        <source media="(max-width: 767px)" srcSet="/hero/hero-mobile.webp" />
        <img
          src="/hero/hero-desktop.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="size-full object-cover object-center"
        />
      </picture>

      {prefersReducedMotion ? null : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          poster="/hero/hero-desktop.webp"
          className="absolute inset-0 size-full object-cover object-center"
        >
          {/* No `type`: with f_auto Cloudinary answers with WebM or MP4 depending
              on the browser, and asserting one would make it skip the source. */}
          <source src={MOBILE_SRC} media="(max-width: 767px)" />
          <source src={DESKTOP_SRC} />
        </video>
      )}

      {/*
       * Scrim.
       *
       * A light wash used to sit here so a dark headline could read over the
       * footage, and it whited out most of the frame — the video was barely
       * visible through it. The hero is a deliberate dark island instead: the
       * headline is white, so the scrim only has to deepen the lower half
       * enough to carry it, and the picture survives.
       *
       * Nothing fades to the page ground at the bottom edge either. A soft seam
       * there reads as a grey band washing out the footage exactly where the
       * mat detail is; the hero simply ends, and the light page starts.
       */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
    </div>
  );
}
