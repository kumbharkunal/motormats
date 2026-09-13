'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

import 'lenis/dist/lenis.css';

/**
 * Document-level Lenis — snappy wheel smoothing without sluggish overshoot.
 * Disabled when `prefers-reduced-motion: reduce`.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.095,
      duration: 0.85,
      wheelMultiplier: 1.12,
      touchMultiplier: 1.35,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      anchors: { duration: 0.9 },
      easing: (t) => 1 - Math.pow(1 - t, 4),
      prevent: (node) => Boolean(node.closest('[data-native-scroll]')),
    });

    document.documentElement.classList.add('lenis', 'lenis-smooth');

    return () => {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      lenis.destroy();
    };
  }, []);

  return null;
}
