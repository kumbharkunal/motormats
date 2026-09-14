import type { Metadata } from 'next';
import Link from 'next/link';

import { BUSINESS, POLICY_UPDATED } from '@/features/marketing/business';
import { PageShell, Prose } from '@/features/marketing/components/page-shell';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms on which Motormats sells and delivers custom-fit car mats.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <PageShell
      breadcrumb="Terms of Service"
      title="Terms of service"
      intro={`Last reviewed ${POLICY_UPDATED}.`}
    >
      <Prose>
        <h2>1. Who these terms are with</h2>
        <p>
          This site is operated by {BUSINESS.legalName} (&ldquo;{BUSINESS.name}&rdquo;,
          &ldquo;we&rdquo;). Placing an order means you accept these terms.
        </p>

        <h2>2. Products and fitment</h2>
        <p>
          Mats are cut to a specific make, model and year. You are responsible for selecting the
          correct vehicle at checkout. If you are unsure, ask us before ordering — we would rather
          check than replace. Photography is representative; colour can vary slightly between
          batches and between screens.
        </p>

        <h2>3. Prices</h2>
        <p>
          Prices are in Indian Rupees and include GST. We may change prices at any time, but the
          price that applies to your order is the one shown when you pay. If a price is listed in
          obvious error, we may cancel the order and refund you in full rather than fulfil it.
        </p>

        <h2>4. Orders</h2>
        <p>
          An order is an offer to buy. It is accepted when we confirm payment. We may decline an
          order — for example where stock has run out, the address cannot be served, or the order
          looks fraudulent — and will refund anything already paid.
        </p>

        <h2>5. Payment</h2>
        <p>
          Payments are handled by Razorpay. An order is treated as paid only once we have verified
          confirmation from the payment provider, not on the browser reporting success.
        </p>

        <h2>6. Delivery and returns</h2>
        <p>
          Delivery timelines and the return window are set out on the{' '}
          <Link href="/shipping-and-returns">Shipping &amp; Returns</Link> page, which forms part of
          these terms.
        </p>

        <h2>7. Acceptable use</h2>
        <p>
          Do not attempt to break, overload or gain unauthorised access to this site, and do not
          scrape it for resale. We may suspend accounts used for fraud or abuse.
        </p>

        <h2>8. Liability</h2>
        <p>
          Nothing here limits liability that cannot lawfully be limited, including for death or
          personal injury caused by negligence, or your rights as a consumer. Subject to that, our
          liability for any order is limited to the amount you paid for it.
        </p>

        <h2>9. Governing law</h2>
        <p>
          These terms are governed by the laws of India, and the courts at {BUSINESS.address.city},{' '}
          {BUSINESS.address.state} have exclusive jurisdiction.
        </p>

        <h2>10. Contact</h2>
        <p>
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>, or the{' '}
          <Link href="/contact">contact page</Link>.
        </p>
      </Prose>
    </PageShell>
  );
}
