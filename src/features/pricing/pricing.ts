// Prices are GST-inclusive; tax is extracted from the total, not added on top.
export const FREE_SHIPPING_THRESHOLD_PAISE = 299_900; // ₹2,999, per the storefront promise
export const FLAT_SHIPPING_PAISE = 9_900; // ₹99

export type PricedLine = {
  variantPublicId: string;
  quantity: number;
  unitPricePaise: number;
  taxRateBps: number;
};

export type LineTotals = PricedLine & {
  lineSubtotalPaise: number;
};

export type Discount =
  | { kind: 'none' }
  | { kind: 'percent'; basisPoints: number; maxDiscountPaise?: number | undefined }
  | { kind: 'fixed'; amountPaise: number };

export type CartTotals = {
  lines: LineTotals[];
  itemCount: number;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  grandTotalPaise: number;
};

export class PricingError extends Error {}

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new PricingError(`${label} must be a non-negative integer, received ${value}`);
  }
}

export function computeLineSubtotal(line: PricedLine): number {
  assertPositiveInteger(line.unitPricePaise, 'unitPricePaise');
  assertPositiveInteger(line.quantity, 'quantity');
  return line.unitPricePaise * line.quantity;
}

export function taxWithin(inclusiveAmountPaise: number, taxRateBps: number): number {
  assertPositiveInteger(inclusiveAmountPaise, 'inclusiveAmountPaise');
  if (taxRateBps < 0) throw new PricingError('taxRateBps must not be negative');
  if (taxRateBps === 0) return 0;

  const denominator = 10_000 + taxRateBps;
  return Math.round((inclusiveAmountPaise * taxRateBps) / denominator);
}

export function computeDiscount(subtotalPaise: number, discount: Discount): number {
  assertPositiveInteger(subtotalPaise, 'subtotalPaise');

  switch (discount.kind) {
    case 'none':
      return 0;
    case 'fixed':
      assertPositiveInteger(discount.amountPaise, 'discount.amountPaise');
      // A discount can never exceed the order, or it would become a payout.
      return Math.min(discount.amountPaise, subtotalPaise);
    case 'percent': {
      if (discount.basisPoints < 0 || discount.basisPoints > 10_000) {
        throw new PricingError('percent discount must be between 0 and 10000 basis points');
      }
      const raw = Math.floor((subtotalPaise * discount.basisPoints) / 10_000);
      const capped = discount.maxDiscountPaise ? Math.min(raw, discount.maxDiscountPaise) : raw;
      return Math.min(capped, subtotalPaise);
    }
  }
}

export function computeShipping(payableAfterDiscountPaise: number): number {
  if (payableAfterDiscountPaise <= 0) return 0;
  return payableAfterDiscountPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : FLAT_SHIPPING_PAISE;
}

export function computeCartTotals(
  lines: PricedLine[],
  discount: Discount = { kind: 'none' },
): CartTotals {
  const priced: LineTotals[] = lines.map((line) => ({
    ...line,
    lineSubtotalPaise: computeLineSubtotal(line),
  }));

  const subtotalPaise = priced.reduce((sum, line) => sum + line.lineSubtotalPaise, 0);
  const discountPaise = computeDiscount(subtotalPaise, discount);
  const payable = subtotalPaise - discountPaise;
  const shippingPaise = computeShipping(payable);

  // Discount is apportioned proportionally across lines so mixed GST rates stay correct.
  const taxPaise = priced.reduce((sum, line) => {
    const share =
      subtotalPaise === 0
        ? 0
        : Math.round((line.lineSubtotalPaise * discountPaise) / subtotalPaise);
    return sum + taxWithin(line.lineSubtotalPaise - share, line.taxRateBps);
  }, 0);

  return {
    lines: priced,
    itemCount: priced.reduce((sum, line) => sum + line.quantity, 0),
    subtotalPaise,
    discountPaise,
    shippingPaise,
    taxPaise,
    grandTotalPaise: payable + shippingPaise,
  };
}
