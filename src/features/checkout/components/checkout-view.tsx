'use client';

import { Check, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { BrandLoader } from '@/components/feedback/brand-loader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressForm } from '@/features/checkout/components/address-form';
import { loadRazorpayCheckout } from '@/features/checkout/components/razorpay';
import {
  confirmPaymentAction,
  placeOrderAction,
  previewCheckoutAction,
} from '@/features/checkout/actions/checkout-actions';
import { listAddressesAction } from '@/features/addresses/actions/address-actions';
import type { SavedAddress } from '@/features/addresses/server/address-repository';
import { formatPaise } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { cartCleared } from '@/store/slices/cart-slice';

type Totals = {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  grandTotalPaise: number;
  couponCode: string | null;
};

export function CheckoutView({
  razorpayKeyId,
  customerName,
  customerPhone,
}: {
  razorpayKeyId: string;
  customerName: string | null;
  customerPhone: string | null;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { lines, hydrated } = useAppSelector((state) => state.cart);

  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  const [totals, setTotals] = useState<Totals | null>(null);

  const [isPaying, startPaying] = useTransition();
  const [, startPreview] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);
  /** The loader caption while a hard navigation is in flight; null when not leaving. */
  const [leavingFor, setLeavingFor] = useState<string | null>(null);

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    void listAddressesAction().then((result) => {
      if (!result.ok) return;
      setAddresses(result.data);
      const preferred = result.data.find((a) => a.isDefault) ?? result.data[0];
      setSelectedAddress(preferred?.publicId ?? null);
      setShowAddressForm(result.data.length === 0);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || lines.length === 0) return;

    startPreview(async () => {
      const result = await previewCheckoutAction({ lines, couponCode: appliedCoupon });
      if (!result.ok) {
        // A coupon that stopped being valid must not block checkout.
        if (appliedCoupon) {
          toast.error(result.message);
          setAppliedCoupon(undefined);
        }
        return;
      }
      setTotals(result.data);
    });
  }, [lines, hydrated, appliedCoupon]);

  // Must be set before dispatch(cartCleared) to prevent the empty-cart guard from redirecting.
  const orderPlaced = useRef(false);

  useEffect(() => {
    if (orderPlaced.current) return;
    if (hydrated && lines.length === 0) router.replace('/cart');
  }, [hydrated, lines.length, router]);

  // Hard navigation: Razorpay modal teardown + React navigation compete; window.location wins.
  function leaveFor(destination: string, label = 'Taking you to your order…') {
    setLeavingFor(label);
    // Commit the overlay to the screen before asking for the new document.
    // Navigating in the same tick races React’s paint against the unload;
    // two frames put the paint first, so it cannot be lost to that race.
    requestAnimationFrame(() => requestAnimationFrame(() => window.location.assign(destination)));
  }

  function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setAppliedCoupon(code);
  }

  function removeCoupon() {
    setAppliedCoupon(undefined);
    setCouponInput('');
  }

  function pay() {
    if (!selectedAddress) {
      toast.error('Choose a delivery address first.');
      return;
    }

    startPaying(async () => {
      // A fresh key per attempt: a retry after a genuine failure is a new
      // order, while a double-click within one attempt is not.
      const idempotencyKey = crypto.randomUUID();

      const placed = await placeOrderAction({
        lines,
        shippingAddressPublicId: selectedAddress,
        couponCode: appliedCoupon,
        idempotencyKey,
      });

      if (!placed.ok) {
        toast.error(placed.message);
        return;
      }

      // From here an order exists in the database, so leaving this page for it
      // is always the right move — never back to the cart.
      orderPlaced.current = true;

      let Razorpay;
      try {
        Razorpay = await loadRazorpayCheckout();
      } catch {
        toast.error('Could not open the payment window. Please check your connection.');
        return;
      }

      const checkout = new Razorpay({
        key: razorpayKeyId,
        amount: placed.data.amountPaise,
        currency: 'INR',
        name: 'Motormats',
        description: `Order ${placed.data.orderNumber}`,
        order_id: placed.data.razorpayOrderId,
        prefill: {
          name: customerName ?? undefined,
          contact: customerPhone ?? undefined,
        },
        notes: { orderNumber: placed.data.orderNumber },
        theme: { color: '#E10600' },
        handler: (response) => {
          setIsConfirming(true);
          void (async () => {
            const confirmed = await confirmPaymentAction({
              orderPublicId: placed.data.orderPublicId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (!confirmed.ok) {
              // Money may still have been taken; the webhook is authoritative,
              // so never tell the customer the payment simply failed.
              toast.error(confirmed.message);
              leaveFor(`/orders/${placed.data.orderPublicId}`);
              return;
            }

            dispatch(cartCleared());
            leaveFor(`/orders/${placed.data.orderPublicId}?placed=1`);
          })();
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled. Your order is saved and can be paid from your orders.');
            leaveFor(`/orders/${placed.data.orderPublicId}`);
          },
        },
      });

      checkout.on('payment.failed', (response) => {
        toast.error(response.error.description || 'Your payment could not be completed.');
      });

      checkout.open();
    });
  }

  if (!hydrated || addresses === null) return <CheckoutSkeleton />;

  // `leavingFor` is checked first: `isConfirming` is never cleared, so once the
  // payment is confirmed and we start navigating, this is what updates the
  // caption from "confirming" to "taking you to your order".
  if (leavingFor) return <BrandLoader label={leavingFor} />;

  if (isConfirming) return <BrandLoader label="Confirming your payment…" />;

  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-8">
        <section aria-labelledby="address-heading">
          <h2 id="address-heading" className="text-h3">
            Delivery address
          </h2>

          {addresses.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {addresses.map((address) => (
                <li key={address.publicId}>
                  <button
                    type="button"
                    onClick={() => setSelectedAddress(address.publicId)}
                    aria-pressed={selectedAddress === address.publicId}
                    className={cn(
                      'w-full rounded-2xl border p-4 text-left transition-colors duration-200',
                      selectedAddress === address.publicId
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-border-strong',
                    )}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-sm font-semibold">{address.fullName}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ''}, {address.city},{' '}
                          {address.state} {address.postalCode}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {address.phone}
                        </span>
                      </span>
                      {selectedAddress === address.publicId ? (
                        <Check aria-hidden className="size-5 shrink-0 text-accent-text" />
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {showAddressForm ? (
            <div className="mt-4">
              <AddressForm
                onSaved={(publicId) => {
                  setShowAddressForm(false);
                  void listAddressesAction().then((result) => {
                    if (result.ok) setAddresses(result.data);
                  });
                  setSelectedAddress(publicId);
                }}
                onCancel={addresses.length > 0 ? () => setShowAddressForm(false) : undefined}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setShowAddressForm(true)}
              type="button"
            >
              <Plus aria-hidden size={16} />
              Add a new address
            </Button>
          )}
        </section>

        <section aria-labelledby="coupon-heading">
          <h2 id="coupon-heading" className="text-h3">
            Coupon
          </h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="coupon">
              Coupon code
            </label>
            <input
              id="coupon"
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value)}
              onKeyDown={(event) => {
                // Enter is what people press in a single-field form.
                if (event.key === 'Enter') {
                  event.preventDefault();
                  applyCoupon();
                }
              }}
              placeholder="Enter a code"
              autoCapitalize="characters"
              disabled={Boolean(totals?.couponCode)}
              className="h-12 flex-1 rounded-full border border-border bg-surface px-5 text-sm disabled:opacity-50"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={applyCoupon}
              disabled={Boolean(totals?.couponCode) || couponInput.trim().length === 0}
            >
              Apply
            </Button>
          </div>
          {totals?.couponCode ? (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-semibold text-accent-text">{totals.couponCode}</span>
              <span className="text-muted-foreground">
                applied — you save {formatPaise(totals.discountPaise)}.
              </span>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-muted-foreground underline underline-offset-4 transition-colors duration-200 hover:text-foreground"
              >
                Remove
              </button>
            </p>
          ) : null}
        </section>
      </div>

      <aside className="rounded-3xl card-surface p-6 lg:sticky lg:top-[calc(var(--header-height)+var(--checkout-steps-height)+1rem)]">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-h3">Order summary</h2>
          {/* Without this the last thing anyone sees before paying is a number
              with no way back to what it is for. */}
          <Link
            href="/cart"
            className="text-xs text-muted-foreground underline underline-offset-4 transition-colors duration-200 hover:text-foreground"
          >
            Edit cart
          </Link>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>

        {totals ? (
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Subtotal" value={formatPaise(totals.subtotalPaise)} />
            {totals.discountPaise > 0 ? (
              <Row label="Discount" value={`− ${formatPaise(totals.discountPaise)}`} accent />
            ) : null}
            <Row
              label="Shipping"
              value={totals.shippingPaise === 0 ? 'Free' : formatPaise(totals.shippingPaise)}
            />
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-h3">{formatPaise(totals.grandTotalPaise)}</dd>
            </div>
            <p className="text-xs text-muted-foreground">
              Includes {formatPaise(totals.taxPaise)} GST
            </p>
          </dl>
        ) : (
          <div className="mt-5 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        )}

        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={pay}
          isLoading={isPaying}
          disabled={!selectedAddress || !totals}
        >
          Pay {totals ? formatPaise(totals.grandTotalPaise) : ''}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Payments are processed securely by Razorpay.
        </p>
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

function CheckoutSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem]" aria-busy="true">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-80 rounded-3xl" />
    </div>
  );
}
