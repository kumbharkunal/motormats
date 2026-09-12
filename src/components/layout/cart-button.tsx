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
      className="relative flex size-12 items-center justify-center rounded-full nav-pill text-foreground/80 transition-colors duration-300 group-data-[over-hero=true]/header:text-white/85 hover:text-foreground group-data-[over-hero=true]/header:hover:text-white active:scale-95"
      aria-label={hydrated && count > 0 ? `Cart, ${count} items` : 'Cart'}
    >
      <ShoppingCart aria-hidden size={19} strokeWidth={1.6} />
      {hydrated && count > 0 ? (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-white ring-2 ring-background"
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
