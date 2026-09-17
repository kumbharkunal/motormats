'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import 'lenis/dist/lenis.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

/**
 * Document-level inertia, and the single place Lenis and ScrollTrigger are
 * joined.
 *
 * The two cannot be left to run independently. Lenis animates the real
 * scroll position off its own rAF loop while ScrollTrigger reads that position
 * on GSAP's ticker, so every scroll-linked animation lands a frame or two
 * behind the page it is pinned to. The fix is to let GSAP drive Lenis instead
 * of Lenis driving itself: `autoRaf: false`, `lenis.raf` on `gsap.ticker`, and
 * `lagSmoothing(0)` so GSAP never tries to compensate for a long frame by
 * jumping the playhead.
 *
 * Reduced motion gets no Lenis at all and no `lenis` class on `<html>`, which
 * is what the homepage suite asserts.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      // GSAP's ticker owns the loop, so Lenis must not run its own.
      autoRaf: false,
      // Responsive, not floaty: the wheel keeps up with the hand and settles
      // within a couple of frames. A lower lerp reads as lag, not smoothness.
      lerp: 0.14,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.6,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      // Next's <Link> handles in-app navigation; the Lenis anchor hijack caused
      // hard jumps and full reloads.
      anchors: false,
      stopInertiaOnNavigate: true,
      prevent: (node) => Boolean(node.closest('[data-native-scroll]')),
    });

    lenisRef.current = lenis;
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.resize();
    // Route changes replace the whole document body, so every trigger's
    // measured start and end are stale until this runs.
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
