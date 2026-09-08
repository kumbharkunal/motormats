'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type { ProductDetail } from '@/features/catalog/server/queries';
import { formatPaise } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store';
import { itemAdded, MAX_QUANTITY_PER_LINE } from '@/store/slices/cart-slice';
import { cartDrawerToggled } from '@/store/slices/ui-slice';

type Variant = ProductDetail['variants'][number];

/**
 * Option-group selection over the product's variants.
 *
 * Options are derived from the variant rows rather than stored separately, so
 * a variant can never advertise a combination that does not exist. Combinations
 * with no matching variant are disabled rather than hidden, which keeps the
 * grid from reflowing as the customer explores.
 */
export function VariantSelector({ product }: { product: ProductDetail }) {
  const dispatch = useAppDispatch();

  const optionGroups = useMemo(() => buildOptionGroups(product.variants), [product.variants]);

  const [selection, setSelection] = useState<Record<string, string>>(() =>
    defaultSelection(product.variants, optionGroups),
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => findVariant(product.variants, selection),
    [product.variants, selection],
  );

  const outOfStock = !selectedVariant || selectedVariant.stockQuantity <= 0;
  const maxQuantity = Math.min(MAX_QUANTITY_PER_LINE, selectedVariant?.stockQuantity ?? 1);

  function addToCart() {
    if (!selectedVariant || outOfStock) return;

    dispatch(itemAdded({ variantPublicId: selectedVariant.publicId, quantity }));
    dispatch(cartDrawerToggled(true));
    toast.success('Added to your cart', {
      description: `${product.name} · ${selectedVariant.name}`,
    });
  }

  return (
    <div className="space-y-6">
      <p className="flex items-baseline gap-3">
        <span className="text-h2 font-display">
          {formatPaise(selectedVariant?.pricePaise ?? product.basePricePaise)}
        </span>
        {product.compareAtPricePaise &&
        product.compareAtPricePaise > (selectedVariant?.pricePaise ?? product.basePricePaise) ? (
          <span className="text-muted-foreground text-sm line-through">
            {formatPaise(product.compareAtPricePaise)}
          </span>
        ) : null}
        <span className="text-muted-foreground text-xs">incl. GST</span>
      </p>

      {optionGroups.map((group) => (
        <fieldset key={group.name}>
          <legend className="text-muted-foreground mb-2 text-xs font-semibold tracking-[0.12em] uppercase">
            {group.label}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => {
              const candidate = { ...selection, [group.name]: value };
              const match = findVariant(product.variants, candidate);
              const unavailable = !match || match.stockQuantity <= 0;
              const active = selection[group.name] === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  disabled={!match}
                  onClick={() => {
                    setSelection(candidate);
                    setQuantity(1);
                  }}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-200',
                    active
                      ? 'border-accent bg-accent text-white'
                      : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
                    !match && 'cursor-not-allowed opacity-35',
                    unavailable && match && 'line-through',
                  )}
                >
                  {active ? <Check aria-hidden size={14} /> : null}
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <StockNotice variant={selectedVariant} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="border-border flex h-12 items-center rounded-full border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || outOfStock}
            aria-label="Decrease quantity"
            className="text-muted-foreground hover:text-foreground flex size-12 items-center justify-center rounded-full text-lg disabled:opacity-40"
          >
            −
          </button>
          <span aria-live="polite" className="w-8 text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={quantity >= maxQuantity || outOfStock}
            aria-label="Increase quantity"
            className="text-muted-foreground hover:text-foreground flex size-12 items-center justify-center rounded-full text-lg disabled:opacity-40"
          >
            +
          </button>
        </div>

        <Button size="lg" onClick={addToCart} disabled={outOfStock} className="flex-1">
          <ShoppingBag aria-hidden size={18} />
          {outOfStock ? 'Sold out' : 'Add to cart'}
        </Button>
      </div>
    </div>
  );
}

function StockNotice({ variant }: { variant: Variant | undefined }) {
  if (!variant) {
    return <p className="text-muted-foreground text-sm">This combination isn&apos;t available.</p>;
  }
  if (variant.stockQuantity <= 0) {
    return <p className="text-muted-foreground text-sm">Out of stock in this finish.</p>;
  }
  if (variant.isLowStock) {
    return (
      <p className="text-accent-text text-sm">Only {variant.stockQuantity} left in this finish.</p>
    );
  }
  return <p className="text-success text-sm">In stock, ships in 2–4 days.</p>;
}

type OptionGroup = { name: string; label: string; values: string[] };

function buildOptionGroups(variants: Variant[]): OptionGroup[] {
  const groups = new Map<string, Set<string>>();

  for (const variant of variants) {
    for (const [name, value] of Object.entries(variant.options ?? {})) {
      (groups.get(name) ?? groups.set(name, new Set()).get(name)!).add(value);
    }
  }

  return [...groups].map(([name, values]) => ({
    name,
    label: name.charAt(0).toUpperCase() + name.slice(1),
    values: [...values],
  }));
}

function findVariant(variants: Variant[], selection: Record<string, string>): Variant | undefined {
  return variants.find((variant) =>
    Object.entries(selection).every(([name, value]) => variant.options?.[name] === value),
  );
}

/** Prefers the first in-stock variant so the page does not open on "sold out". */
function defaultSelection(variants: Variant[], groups: OptionGroup[]): Record<string, string> {
  const preferred = variants.find((variant) => variant.stockQuantity > 0) ?? variants[0];
  if (preferred?.options) return { ...preferred.options };

  return Object.fromEntries(groups.map((group) => [group.name, group.values[0] ?? '']));
}
