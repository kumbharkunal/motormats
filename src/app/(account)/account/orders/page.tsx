import { PackageSearch } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { listOrdersForUser } from '@/features/orders/server/order-queries';
import { getCurrentUser } from '@/lib/auth/current-user';
import { formatPaise } from '@/lib/money';

export const metadata: Metadata = {
  title: 'Your Orders',
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/account/orders');

  const orders = await listOrdersForUser(user.id);

  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <h1 className="text-h1">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-20 text-center">
          <PackageSearch aria-hidden className="size-10 text-subtle-foreground" strokeWidth={1.2} />
          <h2 className="mt-5 text-h3">No orders yet</h2>
          <p className="mt-2 max-w-sm text-sm text-balance text-muted-foreground">
            When you place an order it will appear here with its status and invoice.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/collections">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.publicId}>
              <Link
                href={'/orders/' + order.publicId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl card-surface p-5 transition-colors duration-300 hover:border-accent/30"
              >
                <div>
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <time dateTime={order.createdAt.toISOString()}>
                      {order.createdAt.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                    {' · '}
                    {STATUS_LABELS[order.status] ?? order.status}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatPaise(order.grandTotalPaise)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
