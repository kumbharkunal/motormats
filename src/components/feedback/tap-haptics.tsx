'use client';

import { useEffect } from 'react';

import { tapFeedback } from '@/lib/haptics';

/**
 * A confirming tap under every control on the site, from one listener.
 *
 * The obvious place for this was `Button`, and it cannot go there: `Button`
 * renders inside Server Components — the header and the range grid both do it —
 * and a Server Component cannot attach an event handler to a DOM element at
 * all. Making `Button` a Client Component to hold one `navigator.vibrate` call
 * would pull every button on the site, and everything rendered inside them, into
 * the client bundle.
 *
 * Delegation costs one passive listener on the document and covers controls this
 * codebase does not own — the Radix drawer's dismiss, a native `summary`, the
 * footer's links — which per-component wiring never would.
 *
 * Capture phase, so a handler that calls `stopPropagation` (the compare handle
 * does) cannot swallow the feedback for its own control.
 */

/** Everything a press should be felt on. */
const CONTROLS = [
  'button',
  'a[href]',
  'summary',
  'label[for]',
  '[role="button"]',
  '[role="radio"]',
  '[role="slider"]',
  '[role="tab"]',
  'input[type="submit"]',
].join(',');

export function TapHaptics() {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      // A mouse has no haptics, and a trackpad press is not a tap. This is for
      // fingers; `tapFeedback` itself is a no-op where `vibrate` is absent.
      if (event.pointerType === 'mouse') return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const control = target.closest(CONTROLS);
      if (!control) return;

      // A control that cannot act should not answer.
      if (control.matches(':disabled') || control.getAttribute('aria-disabled') === 'true') return;
      if (control.closest('[data-no-haptic]')) return;

      tapFeedback();
    };

    document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, { capture: true });
  }, []);

  return null;
}
