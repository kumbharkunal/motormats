import { describe, expect, it } from 'vitest';

import { formatPaise, rupeesToPaise } from '@/lib/money';

describe('money', () => {
  it('formats whole rupees without decimals', () => {
    expect(formatPaise(449_900)).toBe('₹4,499');
    expect(formatPaise(0)).toBe('₹0');
  });

  it('shows paise only when they are non-zero', () => {
    expect(formatPaise(449_950)).toBe('₹4,499.50');
  });

  it('groups in the Indian lakh/crore convention', () => {
    // 12,34,567 rupees, not 1,234,567.
    expect(formatPaise(123_456_700)).toBe('₹12,34,567');
  });

  it('refuses non-integer paise rather than silently rounding', () => {
    expect(() => formatPaise(10.5)).toThrow(TypeError);
  });

  it('converts rupees to paise without floating point drift', () => {
    expect(rupeesToPaise(4499.99)).toBe(449_999);
    // 0.1 + 0.2 style error would give 1019.9999999999999 -> 101999
    expect(rupeesToPaise(10.199999999999999)).toBe(1020);
  });
});
