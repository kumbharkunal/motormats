/**
 * Telling a drag from a scroll from a tap.
 *
 * Pure functions, separated from the hook that uses them, because this is the
 * part that has been wrong twice and the part an end-to-end test can only
 * observe indirectly — a Playwright assertion can say "the split did not move"
 * without ever saying which rule rejected the gesture.
 */

/** Travel, in px, before a gesture is anything other than a press. */
export const DRAG_SLOP = 10;

/**
 * How much more horizontal than vertical a swipe must be to take the axis.
 * A thumb arcs, so demanding `dx > dy` outright rejects most real swipes;
 * 1.2 is loose enough for an arc and tight enough that a scroll is never
 * mistaken for a drag.
 */
export const AXIS_RATIO = 1.2;

/** Longest press still read as a tap rather than a slow drag. */
export const TAP_MS = 250;

export type Gesture = 'pending' | 'drag' | 'scroll';

/**
 * What a moving pointer is doing, judged from its *original* start point.
 *
 * Re-evaluated on every move rather than latched. The previous implementation
 * decided once, on the first move past the slop, and set `dragging = false` for
 * anything vertical — so a swipe that began even slightly diagonally could never
 * become a drag, no matter how horizontal it turned. Nothing here ends a
 * gesture: a swipe that really is a scroll is ended by the browser taking the
 * vertical axis, which arrives as `pointercancel`.
 */
export function classifyGesture({ dx, dy }: { dx: number; dy: number }): Gesture {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);

  if (Math.max(ax, ay) < DRAG_SLOP) return 'pending';
  return ax > ay * AXIS_RATIO ? 'drag' : 'scroll';
}

/**
 * Whether a finished pointer was a tap.
 *
 * A tap has to do something. The old component moved the split on mouse-down
 * but ignored touch entirely, so on a phone the handle looked pressable and was
 * not — the single most reported symptom.
 */
export function isTap({ dx, dy, dt }: { dx: number; dy: number; dt: number }): boolean {
  return dt <= TAP_MS && Math.hypot(dx, dy) < DRAG_SLOP;
}

/** Clamp a raw position to the track, as a percentage. */
export function ratioToPercent(clientPos: number, start: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(100, Math.max(0, ((clientPos - start) / length) * 100));
}
