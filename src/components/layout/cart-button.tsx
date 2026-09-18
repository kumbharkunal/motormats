'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';

import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store';

/**
 * False while rendering on the server and through hydration, true after.
 *
 * `useSyncExternalStore` rather than a `setState` in an effect: React reads the
 * server snapshot for the hydrating render and swaps to the client one on the
 * commit, which is precisely the question being asked, with no cascading render
 * and nothing for the compiler to object to. The store never changes, so the
 * subscribe callback is a no-op — but it has to be a stable reference, or every
 * render resubscribes.
 */
const noop = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * The cart, and the badge that reacts when something lands in it.
 *
 * The pop is replayed by keying the badge on the nudge timestamp, so React
 * remounts the element and the CSS animation starts again on its own — no timer
 * to clear and nothing left behind if this unmounts mid-animation.
 *
 * **`mounted` is load-bearing, and removing it broke hydration.** A previous
 * pass took it out on the reasoning that `hydrated` already says whether the
 * cart has come back from storage. It does — but it can already be true during
 * the client's *first* render, and the server always rendered it false. The
 * `aria-label` then differed between the two ("Cart" against "Cart, 3 items")
 * and React threw the whole tree away and re-rendered it. The first client
 * render has to match the server byte for byte, whatever the store knows by
 * then, so the badge waits one commit.
 */
export function CartButton() {
  const { lines, hydrated } = useAppSelector((state) => state.cart);
  const cartNudgeAt = useAppSelector((state) => state.ui.cartNudgeAt);
  const mounted = useSyncExternalStore(noop, onClient, onServer);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const showBadge = mounted && hydrated && count > 0;

  return (
    <Link
      href="/cart"
      className="relative flex size-11 items-center justify-center text-muted-foreground transition-colors duration-300 hover:text-foreground active:scale-95"
      aria-label={showBadge ? `Cart, ${count} items` : 'Cart'}
    >
      <ShoppingCart aria-hidden size={19} strokeWidth={1.6} />
      {showBadge ? (
        <span
          // Remounting on a new nudge is what replays the keyframe.
          key={cartNudgeAt ?? 'idle'}
          aria-hidden
          className={cn(
            'absolute top-0 right-0 flex min-w-4 items-center justify-center bg-accent px-1 text-[0.625rem] font-bold text-white tabular-nums',
            cartNudgeAt ? 'motion-safe:animate-[cart-pop_0.55s_ease-out]' : null,
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
