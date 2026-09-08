import { describe, expect, it } from 'vitest';

import {
  computeCartTotals,
  computeDiscount,
  computeLineSubtotal,
  computeShipping,
  FLAT_SHIPPING_PAISE,
  FREE_SHIPPING_THRESHOLD_PAISE,
  PricingError,
  taxWithin,
  type PricedLine,
} from '@/features/pricing/pricing';

/**
 * The pricing engine decides what customers are charged, so it is tested
 * against the boundaries rather than the happy path: rounding, capping,
 * proportional apportionment, and every input that must be rejected.
 */

const line = (over: Partial<PricedLine> = {}): PricedLine => ({
  variantPublicId: 'V1',
  quantity: 1,
  unitPricePaise: 449_900,
  taxRateBps: 1800,
  ...over,
});

describe('computeLineSubtotal', () => {
  it('multiplies price by quantity in integer paise', () => {
    expect(computeLineSubtotal(line({ quantity: 3 }))).toBe(1_349_700);
  });

  it('is zero for a zero quantity', () => {
    expect(computeLineSubtotal(line({ quantity: 0 }))).toBe(0);
  });

  it('rejects fractional or negative input instead of coercing it', () => {
    expect(() => computeLineSubtotal(line({ quantity: 1.5 }))).toThrow(PricingError);
    expect(() => computeLineSubtotal(line({ quantity: -1 }))).toThrow(PricingError);
    expect(() => computeLineSubtotal(line({ unitPricePaise: 10.5 }))).toThrow(PricingError);
  });
});

describe('taxWithin', () => {
  it('extracts GST from an inclusive amount rather than adding it', () => {
    // 118 inclusive at 18% contains 18 of tax.
    expect(taxWithin(11_800, 1800)).toBe(1_800);
    // The taxable value is what remains.
    expect(11_800 - taxWithin(11_800, 1800)).toBe(10_000);
  });

  it('handles a zero rate and a zero amount', () => {
    expect(taxWithin(11_800, 0)).toBe(0);
    expect(taxWithin(0, 1800)).toBe(0);
  });

  it('never exceeds the amount it is extracted from', () => {
    for (const amount of [1, 7, 99, 100_000, 999_999]) {
      for (const rate of [0, 500, 1200, 1800, 2800]) {
        const tax = taxWithin(amount, rate);
        expect(tax).toBeGreaterThanOrEqual(0);
        expect(tax).toBeLessThanOrEqual(amount);
        expect(Number.isInteger(tax)).toBe(true);
      }
    }
  });

  it('rejects a negative rate', () => {
    expect(() => taxWithin(100, -1)).toThrow(PricingError);
  });
});

describe('computeDiscount', () => {
  it('applies a percentage in basis points', () => {
    expect(computeDiscount(100_000, { kind: 'percent', basisPoints: 1500 })).toBe(15_000);
  });

  it('respects a maximum discount cap', () => {
    expect(
      computeDiscount(1_000_000, {
        kind: 'percent',
        basisPoints: 5000,
        maxDiscountPaise: 100_000,
      }),
    ).toBe(100_000);
  });

  it('never discounts more than the order is worth', () => {
    // A fixed discount larger than the cart must not create a negative total.
    expect(computeDiscount(50_000, { kind: 'fixed', amountPaise: 200_000 })).toBe(50_000);
    expect(computeDiscount(0, { kind: 'fixed', amountPaise: 10_000 })).toBe(0);
  });

  it('rounds a percentage down, never in the customer’s favour by a paisa', () => {
    // 33.33% of 1000 = 333.3 -> 333
    expect(computeDiscount(1_000, { kind: 'percent', basisPoints: 3333 })).toBe(333);
  });

  it('rejects an out-of-range percentage', () => {
    expect(() => computeDiscount(1000, { kind: 'percent', basisPoints: 10_001 })).toThrow(
      PricingError,
    );
    expect(() => computeDiscount(1000, { kind: 'percent', basisPoints: -1 })).toThrow(PricingError);
  });
});

describe('computeShipping', () => {
  it('is free at or above the threshold', () => {
    expect(computeShipping(FREE_SHIPPING_THRESHOLD_PAISE)).toBe(0);
    expect(computeShipping(FREE_SHIPPING_THRESHOLD_PAISE + 1)).toBe(0);
  });

  it('is charged flat below the threshold', () => {
    expect(computeShipping(FREE_SHIPPING_THRESHOLD_PAISE - 1)).toBe(FLAT_SHIPPING_PAISE);
  });

  it('is not charged on an empty order', () => {
    expect(computeShipping(0)).toBe(0);
  });

  it('is decided after the discount, so a coupon can lose free shipping', () => {
    const lines = [line({ unitPricePaise: 320_000 })];
    const withoutCoupon = computeCartTotals(lines);
    const withCoupon = computeCartTotals(lines, { kind: 'fixed', amountPaise: 50_000 });

    expect(withoutCoupon.shippingPaise).toBe(0);
    expect(withCoupon.shippingPaise).toBe(FLAT_SHIPPING_PAISE);
  });
});

describe('computeCartTotals', () => {
  it('totals an empty cart to zero without charging shipping', () => {
    const totals = computeCartTotals([]);
    expect(totals).toMatchObject({
      itemCount: 0,
      subtotalPaise: 0,
      discountPaise: 0,
      shippingPaise: 0,
      taxPaise: 0,
      grandTotalPaise: 0,
    });
  });

  it('sums multiple lines and quantities', () => {
    const totals = computeCartTotals([
      line({ variantPublicId: 'A', unitPricePaise: 100_000, quantity: 2 }),
      line({ variantPublicId: 'B', unitPricePaise: 50_000, quantity: 3 }),
    ]);

    expect(totals.itemCount).toBe(5);
    expect(totals.subtotalPaise).toBe(350_000);
    // ₹3,500 clears the free-shipping threshold, so nothing is added.
    expect(totals.shippingPaise).toBe(0);
    expect(totals.grandTotalPaise).toBe(350_000);
  });

  it('keeps tax inside the total rather than adding it on top', () => {
    const totals = computeCartTotals([line({ unitPricePaise: 11_800, taxRateBps: 1800 })]);

    expect(totals.taxPaise).toBe(1_800);
    // Grand total is the inclusive price plus shipping — tax is not re-added.
    expect(totals.grandTotalPaise).toBe(11_800 + FLAT_SHIPPING_PAISE);
  });

  it('apportions a discount proportionally across mixed tax rates', () => {
    const totals = computeCartTotals(
      [
        line({ variantPublicId: 'A', unitPricePaise: 100_000, taxRateBps: 1800 }),
        line({ variantPublicId: 'B', unitPricePaise: 100_000, taxRateBps: 500 }),
      ],
      { kind: 'percent', basisPoints: 5000 },
    );

    expect(totals.discountPaise).toBe(100_000);
    // Half of each line is discounted, so each contributes tax on 50,000.
    expect(totals.taxPaise).toBe(taxWithin(50_000, 1800) + taxWithin(50_000, 500));
  });

  it('never produces a negative total, however large the coupon', () => {
    const totals = computeCartTotals([line({ unitPricePaise: 10_000 })], {
      kind: 'fixed',
      amountPaise: 999_999,
    });

    expect(totals.grandTotalPaise).toBe(0);
    expect(totals.discountPaise).toBe(10_000);
  });

  it('produces only integer paise for every reported figure', () => {
    const totals = computeCartTotals(
      [
        line({ variantPublicId: 'A', unitPricePaise: 33_333, quantity: 3, taxRateBps: 1800 }),
        line({ variantPublicId: 'B', unitPricePaise: 77_777, quantity: 7, taxRateBps: 1200 }),
      ],
      { kind: 'percent', basisPoints: 1234 },
    );

    for (const value of [
      totals.subtotalPaise,
      totals.discountPaise,
      totals.shippingPaise,
      totals.taxPaise,
      totals.grandTotalPaise,
    ]) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('is deterministic — the same inputs always give the same total', () => {
    const lines = [
      line({ variantPublicId: 'A', unitPricePaise: 449_900, quantity: 2 }),
      line({ variantPublicId: 'B', unitPricePaise: 299_900, quantity: 1 }),
    ];
    const discount = { kind: 'percent', basisPoints: 1500 } as const;

    const first = computeCartTotals(lines, discount);
    const second = computeCartTotals(lines, discount);
    expect(first).toEqual(second);
  });
});
