'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { nudgeCartAdded } from '@/lib/cart-nudge';
import { tapFeedback } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store';
import { itemAdded } from '@/store/slices/cart-slice';

/**
 * Quick-add from a homepage card.
 *
 * The card has no variant picker, so it adds the cheapest in-stock variant.
 * Confirmation is a branded toast, cart badge pulse, and haptic tap on touch devices.
 * A product with nothing in stock renders a disabled
 * control rather than a button that fails on click.
 */
export function QuickAddButton({
  variantPublicId,
  productName,
}: {
  variantPublicId: string | null;
  productName: string;
}) {
  if (!variantPublicId) {
    return (
      <span
        aria-disabled
        title="Out of stock"
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated text-muted-foreground/50"
      >
        <Plus aria-hidden size={20} />
      </span>
    );
  }

  return <AddButton variantPublicId={variantPublicId} productName={productName} />;
}

function AddButton({
  variantPublicId,
  productName,
}: {
  variantPublicId: string;
  productName: string;
}) {
  const dispatch = useAppDispatch();
  const [popping, setPopping] = useState(false);

  function handleClick() {
    tapFeedback();
    dispatch(itemAdded({ variantPublicId, quantity: 1 }));
    nudgeCartAdded(dispatch, productName);
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Add ${productName} to cart`}
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-glow-sm transition-[translate,scale,box-shadow] duration-300 hover:shadow-glow active:scale-90',
        popping && 'animate-[cart-pop_350ms_ease-out]',
      )}
    >
      <Plus aria-hidden size={20} />
    </button>
  );
}
