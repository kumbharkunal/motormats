'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import { classifyGesture, isTap, ratioToPercent } from '@/lib/gesture';
import { tapFeedback } from '@/lib/haptics';

/**
 * A horizontal value you can drag, tap or type, built for a thumb first.
 *
 * **The value does not live in React during a drag.** It is written straight to
 * a registered CSS custom property on the track, which every layer reads. A
 * `setState` per `pointermove` re-rendered the whole comparison sixty times a
 * second to move one number; this re-renders on commit only. React still owns
 * the committed value, so keyboard, ARIA and server rendering are unaffected.
 *
 * **The handle and the track are different controls.** The handle carries
 * `touch-action: none`, so dragging it can never contend with page scroll and
 * needs no heuristic at all. The track carries `touch-action: pan-y` and has to
 * earn the axis — which is what `classifyGesture` decides, on every move,
 * measured from the original touchdown.
 */

const DETENTS = [0, 50, 100];
const DETENT_TOLERANCE = 1.5;
const TAP_ANIMATION_MS = 300;

type Origin = { x: number; y: number; t: number };

export function useDragValue({
  trackRef,
  handleRef,
  cssVar = '--split',
  initial = 50,
  step = 2,
  coarseStep = 10,
  label,
  formatValue,
}: {
  trackRef: RefObject<HTMLElement | null>;
  handleRef: RefObject<HTMLElement | null>;
  cssVar?: string;
  initial?: number;
  step?: number;
  coarseStep?: number;
  label: string;
  formatValue?: (value: number) => string;
}) {
  const [value, setValue] = useState(initial);
  const [isDragging, setIsDragging] = useState(false);

  const latest = useRef(initial);
  const origin = useRef<Origin | null>(null);
  const mode = useRef<'idle' | 'pending' | 'drag'>('idle');
  const lastDetent = useRef<number | null>(initial);
  const animateTimer = useRef(0);

  const paint = useCallback(
    (next: number) => {
      latest.current = next;
      trackRef.current?.style.setProperty(cssVar, `${next}%`);

      const handle = handleRef.current;
      if (!handle) return;
      handle.setAttribute('aria-valuenow', String(Math.round(next)));
      if (formatValue) handle.setAttribute('aria-valuetext', formatValue(next));
    },
    [cssVar, formatValue, handleRef, trackRef],
  );

  /** A tick at each end and at the midpoint, so the range has felt landmarks. */
  const detent = useCallback((next: number) => {
    const hit = DETENTS.find((mark) => Math.abs(next - mark) < DETENT_TOLERANCE) ?? null;
    if (hit !== null && hit !== lastDetent.current) tapFeedback();
    lastDetent.current = hit;
  }, []);

  const fromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const next = ratioToPercent(clientX, rect.left, rect.width);
      paint(next);
      detent(next);
    },
    [detent, paint, trackRef],
  );

  /**
   * Let the CSS transition on the custom property carry a jump.
   *
   * The forced reflow is the whole trick. `animate()` and the `paint()` that
   * follows it run in the same task, so without it the browser coalesces the
   * attribute and the new value into a single style recalculation — the element
   * becomes transitionable and reaches its destination in the same pass, and
   * there is no start value to interpolate from. The result was a hard cut that
   * looked exactly like no animation at all. Reading a layout property commits
   * the attribute first, so the value change afterwards has something to leave.
   */
  const animate = useCallback(
    (durationMs: number = TAP_ANIMATION_MS) => {
      const track = trackRef.current;
      if (!track) return;
      track.style.setProperty('--split-duration', `${durationMs}ms`);
      track.setAttribute('data-animating', 'true');
      void track.offsetWidth;

      window.clearTimeout(animateTimer.current);
      animateTimer.current = window.setTimeout(() => {
        track.removeAttribute('data-animating');
      }, durationMs);
    },
    [trackRef],
  );

  useEffect(() => () => window.clearTimeout(animateTimer.current), []);

  const release = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const target = event.currentTarget;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    mode.current = 'idle';
    origin.current = null;
    setIsDragging(false);
    setValue(latest.current);
  }, []);

  // Paint the committed value rather than rendering it as an inline style: an
  // unrelated re-render must never reset a property the pointer is driving.
  useEffect(() => {
    paint(value);
  }, [paint, value]);

  const handleProps = {
    role: 'slider' as const,
    tabIndex: 0,
    'aria-label': label,
    'aria-orientation': 'horizontal' as const,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': Math.round(value),
    ...(formatValue ? { 'aria-valuetext': formatValue(value) } : {}),
    // The handle owns both axes, so the browser never competes for this gesture.
    style: { touchAction: 'none' as const },

    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      // Capture on the element that received the event. Capturing on an
      // ancestor while a touch is implicitly captured elsewhere is what used to
      // fire `lostpointercapture` mid-gesture.
      event.currentTarget.setPointerCapture(event.pointerId);
      mode.current = 'drag';
      origin.current = { x: event.clientX, y: event.clientY, t: performance.now() };
      setIsDragging(true);
      tapFeedback();
    },

    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
      if (mode.current !== 'drag') return;
      fromClientX(event.clientX);
    },

    onPointerUp: release,
    onPointerCancel: release,

    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
      const grain = event.shiftKey ? coarseStep : step;
      let next = latest.current;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          next -= grain;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          next += grain;
          break;
        case 'PageDown':
          next -= 20;
          break;
        case 'PageUp':
          next += 20;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = 100;
          break;
        default:
          return;
      }

      event.preventDefault();
      next = Math.min(100, Math.max(0, next));
      animate();
      paint(next);
      detent(next);
      setValue(next);
    },
  };

  const trackProps = {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      origin.current = { x: event.clientX, y: event.clientY, t: performance.now() };

      // A mouse has no implicit capture and no scroll to compete with, so it
      // takes the value immediately, as a slider track should.
      if (event.pointerType === 'mouse') {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        mode.current = 'drag';
        setIsDragging(true);
        fromClientX(event.clientX);
        return;
      }

      mode.current = 'pending';
    },

    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
      const start = origin.current;
      if (!start || mode.current === 'idle') return;

      if (mode.current === 'pending') {
        const gesture = classifyGesture({
          dx: event.clientX - start.x,
          dy: event.clientY - start.y,
        });
        // Anything but a drag stays pending. Nothing here ends the gesture: if
        // it really is a scroll the browser takes the axis and sends
        // `pointercancel`, and an arc that straightens still becomes a drag.
        if (gesture !== 'drag') return;

        mode.current = 'drag';
        setIsDragging(true);
        tapFeedback();
      }

      fromClientX(event.clientX);
    },

    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
      const start = origin.current;

      // A tap anywhere on the track moves the split there. Touch used to do
      // nothing at all on press, which is why the control read as broken.
      if (
        start &&
        mode.current === 'pending' &&
        isTap({
          dx: event.clientX - start.x,
          dy: event.clientY - start.y,
          dt: performance.now() - start.t,
        })
      ) {
        animate();
        fromClientX(event.clientX);
      }

      release(event);
    },

    onPointerCancel: release,
  };

  /**
   * Move to a value with the transition on, for anything that is not a pointer:
   * the one-shot hint that shows the control can move at all.
   */
  const animateTo = useCallback(
    (next: number, durationMs?: number) => {
      animate(durationMs);
      paint(next);
      setValue(next);
    },
    [animate, paint],
  );

  return { value, isDragging, animateTo, handleProps, trackProps };
}
