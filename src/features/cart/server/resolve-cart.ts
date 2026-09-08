import 'server-only';

import { getVariantsForPurchase } from '@/features/catalog/server/queries';
import { computeCartTotals, type CartTotals, type Discount, type PricedLine } from '@/features/pricing/pricing';

export type ClientCartLine = {
  variantPublicId: string;
  quantity: number;
};

export type ResolvedCartLine = {
  variantId: number;
  variantPublicId: string;
  quantity: number;
  availableQuantity: number;
  unitPricePaise: number;
  lineTotalPaise: number;
  productName: string;
  productSlug: string;
  variantName: string;
  sku: string;
  imageAssetId: string | null;
  taxRateBps: number;
};

export type ResolvedCart = {
  lines: ResolvedCartLine[];
  totals: CartTotals;
  removed: { variantPublicId: string; reason: 'unavailable' }[];
  adjusted: { variantPublicId: string; requested: number; available: number }[];
};

const MAX_QUANTITY_PER_LINE = 10;

export async function resolveCart(
  clientLines: ClientCartLine[],
  discount: Discount = { kind: 'none' },
): Promise<ResolvedCart> {
  const requested = normalise(clientLines);

  if (requested.length === 0) {
    return { lines: [], totals: computeCartTotals([], discount), removed: [], adjusted: [] };
  }

  const variants = await getVariantsForPurchase(requested.map((line) => line.variantPublicId));
  const byPublicId = new Map(variants.map((variant) => [variant.variantPublicId, variant]));

  const lines: ResolvedCartLine[] = [];
  const removed: ResolvedCart['removed'] = [];
  const adjusted: ResolvedCart['adjusted'] = [];

  for (const line of requested) {
    const variant = byPublicId.get(line.variantPublicId);

    if (!variant || !variant.isActive || variant.productStatus !== 'active') {
      removed.push({ variantPublicId: line.variantPublicId, reason: 'unavailable' });
      continue;
    }

    if (variant.stockQuantity <= 0) {
      removed.push({ variantPublicId: line.variantPublicId, reason: 'unavailable' });
      continue;
    }

    const quantity = Math.min(line.quantity, variant.stockQuantity);
    if (quantity < line.quantity) {
      adjusted.push({
        variantPublicId: line.variantPublicId,
        requested: line.quantity,
        available: variant.stockQuantity,
      });
    }

    const unitPricePaise = variant.variantPricePaise ?? variant.basePricePaise;

    lines.push({
      variantId: variant.variantId,
      variantPublicId: variant.variantPublicId,
      quantity,
      availableQuantity: variant.stockQuantity,
      unitPricePaise,
      lineTotalPaise: unitPricePaise * quantity,
      productName: variant.productName,
      productSlug: variant.productSlug,
      variantName: variant.variantName,
      sku: variant.sku,
      imageAssetId: variant.imageAssetId,
      taxRateBps: variant.taxRateBps,
    });
  }

  const priced: PricedLine[] = lines.map((line) => ({
    variantPublicId: line.variantPublicId,
    quantity: line.quantity,
    unitPricePaise: line.unitPricePaise,
    taxRateBps: line.taxRateBps,
  }));

  return { lines, totals: computeCartTotals(priced, discount), removed, adjusted };
}

function normalise(clientLines: ClientCartLine[]): ClientCartLine[] {
  const merged = new Map<string, number>();

  for (const line of clientLines) {
    if (typeof line?.variantPublicId !== 'string' || line.variantPublicId.length === 0) continue;
    const quantity = Number(line.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const next = (merged.get(line.variantPublicId) ?? 0) + Math.trunc(quantity);
    merged.set(line.variantPublicId, Math.min(MAX_QUANTITY_PER_LINE, next));
  }

  return [...merged].map(([variantPublicId, quantity]) => ({ variantPublicId, quantity }));
}
