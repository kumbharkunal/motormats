'use client';

import { Loader2, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { resolveCartAction, type ClientCart } from '@/features/cart/actions/cart-actions';
import { QuantityStepper } from '@/features/cart/components/quantity-stepper';
import { formatPaise } from '@/lib/money';
import { useAppDispatch, useAppSelector } from '@/store';
import { itemRemoved, MAX_QUANTITY_PER_LINE, quantityChanged } from '@/store/slices/cart-slice';

/**
 * The cart is stored locally as variant ids and quantities only; this component
 * asks the server to price it. Nothing monetary is ever computed here, so a
 * tampered local cart changes the line list, never the amounts.
 */
export function CartView() {
  const dispatch = useAppDispatch();
  const { lines, hydrated } = useAppSelector((state) => state.cart);

  const [resolved, setResolved] = useState<ClientCart | null>(null);
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // The empty and unhydrated cases are handled in render, so no state is
    // written here for them.
    if (!hydrated || lines.length === 0) return;

    let cancelled = false;
    startTransition(async () => {
      const result = await resolveCartAction({ lines });
      if (cancelled) return;

      if (!result.ok) {
        setFailed(true);
        toast.error(result.message);
        return;
      }

      setFailed(false);
      setResolved(result.data);

      for (const removedLine of result.data.removed) {
        dispatch(itemRemoved(removedLine.variantPublicId));
      }
      if (result.data.removed.length > 0) {
        toast.info('Some items are no longer available and were removed.');
      }
      for (const adjustment of result.data.adjusted) {
        dispatch(
          quantityChanged({
            variantPublicId: adjustment.variantPublicId,
            quantity: adjustment.available,
          }),
        );
      }
      if (result.data.adjusted.length > 0) {
        toast.info('We reduced a quantity to match the stock we have left.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [lines, hydrated, dispatch]);

  if (!hydrated) return <CartSkeleton />;
  if (lines.length === 0) return <EmptyCart />;
  if (failed) return <CartError />;
  if (!resolved) return <CartSkeleton />;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
      <ul className="space-y-3">
        {resolved.lines.map((line) => {
          const max = Math.min(MAX_QUANTITY_PER_LINE, line.availableQuantity);

          return (
            <li
              key={line.variantPublicId}
              className="card-surface flex gap-4 rounded-2xl p-4 md:gap-5 md:rounded-3xl md:p-5"
            >
              <Link
                href={`/products/${line.productSlug}`}
                className="bg-surface relative size-20 shrink-0 overflow-hidden rounded-xl md:size-28 md:rounded-2xl"
              >
                {line.imageAssetId ? (
                  <Image
                    src={line.imageAssetId}
                    alt={line.productName}
                    fill
                    sizes="(max-width: 767px) 80px, 112px"
                    className="object-cover"
                  />
                ) : null}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${line.productSlug}`}
                      className="hover:text-accent-text text-sm font-semibold transition-colors duration-200 md:text-base"
                    >
                      {line.productName}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 text-xs">{line.variantName}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatPaise(line.unitPricePaise)} each
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold md:text-base">
                    {formatPaise(line.lineTotalPaise)}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                  <QuantityStepper
                    value={line.quantity}
                    max={max}
                    label={line.productName}
                    onChange={(quantity) =>
                      dispatch(quantityChanged({ variantPublicId: line.variantPublicId, quantity }))
                    }
                  />

                  <button
                    type="button"
                    onClick={() => dispatch(itemRemoved(line.variantPublicId))}
                    className="text-muted-foreground hover:text-accent-text flex size-11 items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/5"
                    aria-label={`Remove ${line.productName}`}
                  >
                    <Trash2 aria-hidden size={16} />
                  </button>

                  {line.quantity >= max ? (
                    <span className="text-subtle-foreground text-[0.6875rem]">
                      Only {max} left
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="card-surface rounded-3xl p-6 lg:sticky lg:top-24">
        <h2 className="text-h3">Order summary</h2>

        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Subtotal" value={formatPaise(resolved.totals.subtotalPaise)} />
          {resolved.totals.discountPaise > 0 ? (
            <Row
              label="Discount"
              value={`− ${formatPaise(resolved.totals.discountPaise)}`}
              accent
            />
          ) : null}
          <Row
            label="Shipping"
            value={
              resolved.totals.shippingPaise === 0
                ? 'Free'
                : formatPaise(resolved.totals.shippingPaise)
            }
          />
          <div className="border-border flex items-baseline justify-between border-t pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="text-h3 font-display">
              {formatPaise(resolved.totals.grandTotalPaise)}
            </dd>
          </div>
          <p className="text-muted-foreground text-xs">
            Includes {formatPaise(resolved.totals.taxPaise)} GST
          </p>
        </dl>

        <Button asChild size="lg" className="mt-6 w-full">
          <Link href="/checkout">
            {isPending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            Proceed to checkout
          </Link>
        </Button>

        <Button asChild variant="ghost" className="mt-3 w-full">
          <Link href="/collections">Continue shopping</Link>
        </Button>
      </aside>
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ? 'text-accent-text' : undefined}>{value}</dd>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="border-border mt-8 flex flex-col items-center rounded-3xl border border-dashed px-6 py-20 text-center">
      <ShoppingBag aria-hidden className="text-subtle-foreground size-10" strokeWidth={1.2} />
      <h2 className="text-h3 mt-5">Your cart is empty</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm text-balance">
        Once you add a set of mats, it will appear here.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/collections">Browse collections</Link>
      </Button>
    </div>
  );
}

function CartError() {
  return (
    <div className="border-border mt-8 rounded-3xl border border-dashed px-6 py-16 text-center">
      <h2 className="text-h3">We couldn&apos;t load your cart</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Please refresh the page. Your items are still saved.
      </p>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]" aria-busy="true">
      <ul className="space-y-3">
        {Array.from({ length: 2 }, (_, i) => (
          <li key={i} className="card-surface flex gap-4 rounded-2xl p-4 md:gap-5 md:rounded-3xl md:p-5">
            <Skeleton className="size-20 shrink-0 rounded-xl md:size-28 md:rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="mt-3 h-11 w-36 rounded-full" />
            </div>
            <Skeleton className="h-4 w-16" />
          </li>
        ))}
      </ul>
      <Skeleton className="h-80 rounded-3xl" />
    </div>
  );
}
