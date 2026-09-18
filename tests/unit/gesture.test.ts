import { describe, expect, it } from 'vitest';

import { classifyGesture, isTap, ratioToPercent } from '@/lib/gesture';

/**
 * The rules behind "drag to compare" working with a thumb.
 *
 * Each case here is a gesture that was broken in the previous implementation.
 */
describe('classifyGesture', () => {
  it('waits while the pointer is still inside the slop', () => {
    expect(classifyGesture({ dx: 4, dy: 3 })).toBe('pending');
  });

  it('takes a clean horizontal swipe', () => {
    expect(classifyGesture({ dx: 40, dy: 2 })).toBe('drag');
  });

  it('takes a diagonal swipe that is mostly horizontal', () => {
    // A thumb arcs. This is the case that used to kill the gesture outright.
    expect(classifyGesture({ dx: 30, dy: 20 })).toBe('drag');
  });

  it('leaves a mostly vertical swipe to the page', () => {
    expect(classifyGesture({ dx: 8, dy: 40 })).toBe('scroll');
  });

  it('leaves an ambiguous 45-degree swipe to the page', () => {
    expect(classifyGesture({ dx: 30, dy: 30 })).toBe('scroll');
  });

  it('is direction agnostic — a right-to-left drag is still a drag', () => {
    expect(classifyGesture({ dx: -40, dy: 2 })).toBe('drag');
  });

  it('never latches: a gesture that starts vertical can still become a drag', () => {
    // Both are measured from the same origin, which is the whole point.
    expect(classifyGesture({ dx: 6, dy: 14 })).toBe('scroll');
    expect(classifyGesture({ dx: 48, dy: 16 })).toBe('drag');
  });
});

describe('isTap', () => {
  it('accepts a quick press that barely moves', () => {
    expect(isTap({ dx: 2, dy: 3, dt: 90 })).toBe(true);
  });

  it('rejects a press held too long', () => {
    expect(isTap({ dx: 1, dy: 1, dt: 900 })).toBe(false);
  });

  it('rejects a press that travelled', () => {
    expect(isTap({ dx: 24, dy: 1, dt: 120 })).toBe(false);
  });
});

describe('ratioToPercent', () => {
  it('maps a position inside the track', () => {
    expect(ratioToPercent(150, 100, 200)).toBe(25);
  });

  it('clamps past either end rather than overshooting', () => {
    expect(ratioToPercent(40, 100, 200)).toBe(0);
    expect(ratioToPercent(999, 100, 200)).toBe(100);
  });

  it('survives a track that has not been laid out yet', () => {
    expect(ratioToPercent(50, 0, 0)).toBe(0);
  });
});
