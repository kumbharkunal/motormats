'use client';

import { Plus } from 'lucide-react';

import { tapFeedback } from '@/lib/haptics';
import { useAppDispatch } from '@/store';
import { itemAdded } from '@/store/slices/cart-slice';
import { cartDrawerToggled } from '@/store/slices/ui-slice';

/**
 * Quick-add from a homepage card.
 *
 * The card has no variant picker, so it adds the cheapest in-stock variant.
 * Confirmation is the header's cart count ticking up, plus a haptic tap on a
 * touch device — deliberately no toast, which was too loud for an action people
 * repeat across a grid. A product with nothing in stock renders a disabled
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
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-white/5 text-muted-foreground/50"
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

  function handleClick() {
    tapFeedback();
    dispatch(itemAdded({ variantPublicId, quantity: 1 }));
    dispatch(cartDrawerToggled(true));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Add ${productName} to cart`}
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_4px_15px_rgba(225,6,0,0.35)] transition-[transform,box-shadow] duration-300 hover:shadow-[0_8px_25px_rgba(225,6,0,0.55)] active:scale-90"
    >
      <Plus aria-hidden size={20} />
    </button>
  );
}
