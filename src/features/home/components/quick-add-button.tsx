'use client';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch } from '@/store';
import { itemAdded } from '@/store/slices/cart-slice';
import { cartDrawerToggled } from '@/store/slices/ui-slice';

/**
 * Quick-add from a homepage card.
 *
 * The card has no variant picker, so it adds the cheapest in-stock variant and
 * opens the drawer — the customer sees exactly what landed in the cart and can
 * change it there. A product with nothing in stock renders a disabled control
 * rather than a button that fails on click.
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
        className="text-muted-foreground/50 border-border flex size-11 shrink-0 items-center justify-center rounded-full border bg-white/5"
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
    // Confirms the tap on touch devices. Unsupported on iOS Safari and behind a
    // user setting elsewhere, so it is strictly an enhancement.
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }

    dispatch(itemAdded({ variantPublicId, quantity: 1 }));
    dispatch(cartDrawerToggled(true));
    toast.success('Added to your cart', { description: productName });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Add ${productName} to cart`}
      className="bg-accent flex size-11 shrink-0 items-center justify-center rounded-full text-white shadow-[0_4px_15px_rgba(225,6,0,0.35)] transition-[transform,box-shadow] duration-300 hover:shadow-[0_8px_25px_rgba(225,6,0,0.55)] active:scale-90"
    >
      <Plus aria-hidden size={20} />
    </button>
  );
}
