'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';

import { makeStore, type AppStore } from '@/store';
import { cartHydrated, type CartLine } from '@/store/slices/cart-slice';
import { wishlistHydrated } from '@/store/slices/wishlist-slice';

const CART_KEY = 'motormats.cart.v1';
const WISHLIST_KEY = 'motormats.wishlist.v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    store.dispatch(cartHydrated(readJson<CartLine[]>(CART_KEY, [])));
    store.dispatch(wishlistHydrated(readJson<string[]>(WISHLIST_KEY, [])));

    let previousCart = '';
    let previousWishlist = '';

    return store.subscribe(() => {
      const state = store.getState();

      const cart = JSON.stringify(state.cart.lines);
      if (state.cart.hydrated && cart !== previousCart) {
        previousCart = cart;
        writeJson(CART_KEY, state.cart.lines);
      }

      const wishlist = JSON.stringify(state.wishlist.slugs);
      if (state.wishlist.hydrated && wishlist !== previousWishlist) {
        previousWishlist = wishlist;
        writeJson(WISHLIST_KEY, state.wishlist.slugs);
      }
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: quota exceeded or storage blocked
  }
}
