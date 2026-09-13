import type { Metadata } from 'next';
import Link from 'next/link';

import { BUSINESS, POLICY_UPDATED } from '@/features/marketing/business';
import { PageShell, Prose } from '@/features/marketing/components/page-shell';
import { formatPaise } from '@/lib/money';

export const metadata: Metadata = {
  title: 'Shipping & Returns',
  description:
    'Delivery charges and timelines and the Motormats return window.',
  alternates: { canonical: '/shipping-and-returns' },
};

export default function ShippingAndReturnsPage() {
  return (
    <PageShell
      breadcrumb="Shipping & Returns"
      title="Shipping & returns"
      intro={`Last reviewed ${POLICY_UPDATED}.`}
    >
      <Prose>
        <h2>Delivery charges</h2>
        <p>
          Delivery is free on orders over {formatPaise(BUSINESS.freeShippingOverPaise)}. Below that
          threshold a flat charge applies and is shown in the order summary before payment. All
          prices on this site include GST.
        </p>

        <h2>Dispatch and delivery time</h2>
        <p>
          Mats are cut per vehicle, so orders are made after you place them rather than picked from
          a shelf. Dispatch takes {BUSINESS.dispatchDays}, and delivery normally adds a further two
          to five days depending on the destination. A tracking link is sent when the parcel leaves
          us.
        </p>

        <h2>Where we deliver</h2>
        <p>
          We ship across India. Some remote pin codes are served by a slower partner network; if
          yours is one of them we will tell you before dispatch rather than after.
        </p>

        <h2>Returns</h2>
        <p>
          Unused sets in their original packaging can be returned within {BUSINESS.returnWindowDays}{' '}
          days of delivery. Start a return by contacting us with your order number.
        </p>
        <ul>
          <li>Refunds are issued to the original payment method once the set is back with us.</li>
          <li>
            Sets that have been fitted and used cannot be resold, so they are not eligible for a
            change-of-mind return. Contact us if something arrives faulty or the wrong pattern was
            sent.
          </li>
          <li>
            If we sent the wrong pattern or the set is faulty on arrival, the return is free and we
            arrange the pickup.
          </li>
        </ul>

        <h2>Cancellations</h2>
        <p>
          An order can be cancelled for a full refund any time before it is dispatched. Once cutting
          has started the set is specific to your vehicle and can no longer be cancelled.
        </p>

        <h2>Getting help</h2>
        <p>
          Contact us at <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or through the{' '}
          <Link href="/contact">contact page</Link> with your order number.
        </p>
      </Prose>
    </PageShell>
  );
}
