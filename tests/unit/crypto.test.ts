import { describe, expect, it } from 'vitest';

import { randomToken, safeEqual, sha256 } from '@/lib/crypto';
import { isPublicId, newPublicId } from '@/lib/ids';

describe('crypto helpers', () => {
  it('produces a stable, known SHA-256', () => {
    // Standard vector for the empty string.
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('generates distinct high-entropy tokens', () => {
    const tokens = new Set(Array.from({ length: 500 }, () => randomToken()));
    expect(tokens.size).toBe(500);
    expect(randomToken(32)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('compares equal and unequal values correctly', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    // Different lengths must not throw.
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(safeEqual('', '')).toBe(true);
  });
});

describe('public ids', () => {
  it('mints valid, unique, sortable ULIDs', () => {
    const ids = Array.from({ length: 200 }, () => newPublicId());
    expect(new Set(ids).size).toBe(200);
    for (const id of ids) {
      expect(id).toHaveLength(26);
      expect(isPublicId(id)).toBe(true);
    }
  });

  it('rejects anything that is not a ULID', () => {
    expect(isPublicId('')).toBe(false);
    expect(isPublicId('123')).toBe(false);
    expect(isPublicId(42)).toBe(false);
    // I, L, O and U are excluded from Crockford base32.
    expect(isPublicId('01ARZ3NDEKTSV4RRFFQ69G5FAI')).toBe(false);
  });
});
