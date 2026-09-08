import type { Metadata } from 'next';

import { CartView } from '@/features/cart/components/cart-view';

export const metadata: Metadata = {
  title: 'Your Cart',
  // A cart is personal and has no search value.
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="text-h1">Your Cart</h1>
      <CartView />
    </div>
  );
}
