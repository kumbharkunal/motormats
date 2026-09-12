'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

import 'lenis/dist/lenis.css';

/**
 * Smooth scrolling for the whole storefront.
 *
 * Renders nothing — it owns a single Lenis instance bound to the document.
 * Lenis was a dependency for a long time without ever being imported, because
 * the homepage was a Swiper deck that consumed the wheel itself and the
 * animation contract forbade running both. With the deck gone it has the wheel
 * to itself.
 *
 * Off entirely under `prefers-reduced-motion`: hijacking the wheel is exactly
 * what that setting asks us not to do, and native scrolling is the correct
 * fallback rather than a faster animation.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      // `autoRaf` defaults to FALSE. Without it Lenis still cancels the wheel
      // event but never runs the loop that would move the page, so the document
      // sits perfectly still under the wheel while `scrollTo` keeps working —
      // which is exactly how it got past a test that only scrolled
      // programmatically.
      autoRaf: true,
      // Slightly shorter and flatter than the library default, which overshoots
      // for a commerce site — a visitor scanning a product grid wants the page
      // to arrive, not to glide.
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      // Takes over in-page anchors, including the skip-to-content link. Native
      // anchor jumps and a hijacked scroll position otherwise disagree.
      anchors: true,
      // Touch is left alone: mobile browsers already scroll well, and taking it
      // over breaks the address-bar collapse and rubber-banding.
      smoothWheel: true,
      syncTouch: false,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
