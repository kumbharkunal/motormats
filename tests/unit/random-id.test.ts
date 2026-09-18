import { describe, expect, it } from 'vitest';

import { randomUUID } from '@/lib/random-id';

/**
 * The idempotency key for order creation comes from here.
 *
 * `crypto.randomUUID` only exists in a secure context, so on any plain-http
 * origin — a LAN address during testing, an http tunnel — it is simply absent
 * and checkout used to throw at the point of placing the order. The fallback
 * path is the one that actually runs in those environments, so it is the one
 * worth pinning: it has to produce a real v4, and it has to not repeat.
 */
const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** An insecure context: `getRandomValues` present, `randomUUID` gone. */
function withoutRandomUUID() {
  Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
}

describe('randomUUID', () => {
  it('returns a v4 UUID where crypto.randomUUID exists', () => {
    expect(randomUUID()).toMatch(V4);
  });

  it('returns a v4 UUID where crypto.randomUUID does not exist', () => {
    const original = crypto.randomUUID;
    withoutRandomUUID();

    try {
      expect(typeof crypto.randomUUID).not.toBe('function');
      expect(randomUUID()).toMatch(V4);
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true });
    }
  });

  it('does not repeat, on either path', () => {
    const original = crypto.randomUUID;
    withoutRandomUUID();

    try {
      const keys = new Set(Array.from({ length: 2000 }, () => randomUUID()));
      expect(keys.size).toBe(2000);
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true });
    }
  });
});
