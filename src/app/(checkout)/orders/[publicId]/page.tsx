import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { OrderPlacedCelebration } from '@/features/orders/components/order-placed-celebration';
import { getOrderForUser } from '@/features/orders/server/order-queries';
import { getCurrentUser } from '@/lib/auth/current-user';
import { formatPaise } from '@/lib/money';

export const metadata: Metadata = {
  title: 'Order',
  robots: { index: false, follow: false },
};

const STATUS_COPY: Record<string, { label: string; detail: string }> = {
  pending_payment: {
    label: 'Awaiting payment',
    detail: 'We are holding your items. Complete the payment to confirm this order.',
  },
  paid: { label: 'Confirmed', detail: 'Thank you. We are preparing your order.' },
  processing: { label: 'Processing', detail: 'Your mats are being cut and packed.' },
  shipped: { label: 'Shipped', detail: 'On its way to you.' },
  delivered: { label: 'Delivered', detail: 'Enjoy the drive.' },
  cancelled: { label: 'Cancelled', detail: 'This order was cancelled.' },
  refunded: { label: 'Refunded', detail: 'Your refund has been issued.' },
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const [{ publicId }, query] = await Promise.all([params, searchParams]);
  // Scoped to the signed-in user, so another customer's order id resolves to a 404.
  const order = await getOrderForUser(user.id, publicId);
  if (!order) notFound();

  const status = STATUS_COPY[order.status] ?? { label: order.status, detail: '' };
  const address = order.shippingAddress;
  // Only celebrate a real, paid order — `?placed=1` alone is a URL anyone can type.
  const justPlaced = query.placed === '1' && order.status === 'paid';

  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      {justPlaced ? (
        <div className="mb-12">
          <OrderPlacedCelebration orderNumber={order.orderNumber} />
        </div>
      ) : (
        <>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Order {order.orderNumber}
          </p>
          <h1 className="mt-2 text-h1">{status.label}</h1>
          <p className="mt-2 text-muted-foreground">{status.detail}</p>
        </>
      )}

      <ul className="mt-8 divide-y divide-border">
        {order.items.map((item, index) => (
          <li key={item.sku + String(index)} className="flex gap-4 py-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface">
              {item.imageAssetId ? (
                <Image
                  src={item.imageAssetId}
                  alt={item.productName}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={'/products/' + item.productSlug} className="text-sm font-semibold">
                {item.productName}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.variantName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatPaise(item.unitPricePaise)} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold">{formatPaise(item.lineTotalPaise)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 border-t border-border pt-6 text-sm">
        <Row label="Subtotal" value={formatPaise(order.subtotalPaise)} />
        {order.discountPaise > 0 ? (
          <Row
            label={order.couponCode ? 'Discount (' + order.couponCode + ')' : 'Discount'}
            value={'− ' + formatPaise(order.discountPaise)}
          />
        ) : null}
        <Row
          label="Shipping"
          value={order.shippingPaise === 0 ? 'Free' : formatPaise(order.shippingPaise)}
        />
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="font-sans text-h3 font-semibold tabular-nums">
            {formatPaise(order.grandTotalPaise)}
          </dd>
        </div>
        <p className="text-xs text-muted-foreground">Includes {formatPaise(order.taxPaise)} GST</p>
      </dl>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-h3">Delivery address</h2>
        <address className="mt-3 text-sm text-muted-foreground not-italic">
          {address.fullName}
          <br />
          {address.line1}
          {address.line2 ? ', ' + address.line2 : null}
          <br />
          {address.city}, {address.state} {address.postalCode}
          <br />
          {address.phone}
        </address>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="ghost">
          <Link href="/account/orders">All orders</Link>
        </Button>
        <Button asChild>
          <Link href="/collections">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
