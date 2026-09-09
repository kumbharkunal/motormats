/**
 * Confirmation haptics for touch devices.
 *
 * Centralised because the two inline call sites had drifted to different
 * durations, and a third (the product page) had none at all — so the same
 * gesture felt different depending on where you made it.
 *
 * Strictly an enhancement: `navigator.vibrate` is absent on iOS Safari and
 * behind a user setting elsewhere. Never gate behaviour on it.
 */

/** Matches the CSS `prefers-reduced-motion` guard used across the app. */
function wantsReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function buzz(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  // Someone who has asked for less motion has not asked for a buzzing phone
  // either; the visual and toast feedback still lands.
  if (wantsReducedMotion()) return;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw when the document has never been interacted with.
  }
}

/** A single light tap — adding to the cart, changing a quantity. */
export function tapFeedback(): void {
  buzz(12);
}

/** A slightly heavier double pulse for a completed, irreversible action. */
export function confirmFeedback(): void {
  buzz([10, 40, 18]);
}
