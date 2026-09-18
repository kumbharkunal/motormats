import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

/**
 * The one handle on the page's scroll, for the code that has to move it.
 *
 * `SmoothScroll` owns the Lenis instance, but three things outside it need to
 * reach the same object: a deliberate height change has to re-measure
 * immediately, the mobile drawer has to stop the page behind it, and the fit
 * wizard has to scroll the reader to the step it just opened.
 *
 * A module-level ref rather than context, because every consumer is an event
 * handler. Context would re-render the tree on mount for a value no render path
 * reads.
 *
 * Every export is a no-op when Lenis is absent — which is the normal state under
 * `prefers-reduced-motion`, where `SmoothScroll` never constructs one and native
 * scrolling takes over. Callers must not branch on it.
 */

let instance: Lenis | null = null;

/** Called by `SmoothScroll` on mount, and with `null` on cleanup. */
export function publishLenis(lenis: Lenis | null): void {
  instance = lenis;
}

/**
 * Re-measure now, not in 150ms.
 *
 * `SmoothScroll` observes the body and re-measures on a debounce, which is right
 * for height changes nobody predicted. A change we *caused* already knows when
 * it finished, and waiting out the debounce is what makes the page jump under
 * the thumb after a tap. Call this synchronously at the end of the change.
 */
export function resyncScroll(): void {
  instance?.resize();
  ScrollTrigger.refresh();
}

/**
 * Freeze the page behind an overlay.
 *
 * Radix locks `<body>` while a Dialog is open, but Lenis animates the real
 * scroll position and never sees that lock — so the page kept drifting behind
 * the open drawer. Pair every `stopScroll` with a `startScroll`.
 */
export function stopScroll(): void {
  instance?.stop();
}

export function startScroll(): void {
  instance?.start();
}

/**
 * Scroll an element into view through Lenis, falling back to the native path
 * when Lenis is not running.
 */
export function scrollToElement(target: HTMLElement, offset = 0): void {
  if (instance) {
    // `force`, because the mobile drawer stops Lenis while it is open and the
    // link that asks for this scroll is usually inside that drawer. A scroll
    // issued to a stopped instance is silently dropped, which read as the menu
    // item simply doing nothing.
    instance.scrollTo(target, { offset, duration: 0.5, force: true });
    return;
  }

  // No Lenis means reduced motion, where `globals.css` has already removed
  // `scroll-behavior: smooth` — this lands instantly, which is correct there.
  //
  // Not `scrollIntoView`: it has nowhere to put the offset, so the target's top
  // edge ends up flush against the viewport top and therefore underneath the
  // sticky header. The offset is the whole reason callers pass one.
  const top = target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: 'auto' });
}
