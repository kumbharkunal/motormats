import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { CheckoutView } from '@/features/checkout/components/checkout-view';
import { getCurrentUser } from '@/lib/auth/current-user';
import { clientEnv } from '@/lib/env.client';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // proxy.ts already redirects unauthenticated visitors; this is the
  // authoritative check, since the proxy only inspects cookie presence.
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/checkout');

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="text-h1">Checkout</h1>
      <CheckoutView
        razorpayKeyId={clientEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID}
        customerName={user.name}
        customerPhone={user.phone}
      />
    </div>
  );
}
