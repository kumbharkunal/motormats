'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

import { useAppSelector } from '@/store';

export function CartButton() {
  const { lines, hydrated } = useAppSelector((state) => state.cart);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Link
      href="/cart"
      className="nav-pill text-foreground/80 hover:text-foreground relative flex size-12 items-center justify-center rounded-full transition-colors duration-300 active:scale-95"
      aria-label={hydrated && count > 0 ? `Cart, ${count} items` : 'Cart'}
    >
      <ShoppingCart aria-hidden size={19} strokeWidth={1.6} />
      {hydrated && count > 0 ? (
        <span
          aria-hidden
          className="bg-accent ring-background absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[0.625rem] font-bold text-white ring-2"
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
