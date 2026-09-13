'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store';

export function CartButton() {
  const { lines, hydrated } = useAppSelector((state) => state.cart);
  const cartNudgeAt = useAppSelector((state) => state.ui.cartNudgeAt);
  const [mounted, setMounted] = useState(false);
  const [pulse, setPulse] = useState(false);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const showBadge = mounted && hydrated && count > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!cartNudgeAt) return;
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 700);
    return () => window.clearTimeout(timer);
  }, [cartNudgeAt]);

  return (
    <Link
      href="/cart"
      className={cn(
        'relative flex size-12 items-center justify-center rounded-full nav-pill text-foreground/80 transition-colors duration-300 group-data-[over-hero=true]/header:text-white/85 hover:text-foreground group-data-[over-hero=true]/header:hover:text-white active:scale-95',
        pulse && 'animate-[cart-pop_0.55s_ease-out]',
      )}
      aria-label={showBadge ? `Cart, ${count} items` : 'Cart'}
    >
      <ShoppingCart aria-hidden size={19} strokeWidth={1.6} />
      {showBadge ? (
        <span
          aria-hidden
          className={cn(
            'absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-white ring-2 ring-background transition-transform duration-300',
            pulse && 'scale-125',
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
