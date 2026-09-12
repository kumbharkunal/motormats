import type { Metadata } from 'next';
import Link from 'next/link';

import { BUSINESS } from '@/features/marketing/business';
import { PageShell } from '@/features/marketing/components/page-shell';
import { formatPaise } from '@/lib/money';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Fitment, delivery, payment, warranty and returns — the questions we are asked most about Motormats car mats.',
  alternates: { canonical: '/faq' },
};

const FAQS = [
  {
    q: 'How do I know the mats will fit my car?',
    a: 'Patterns are cut per make, model and year, so you choose your vehicle rather than a size. If your variant is not listed, send us the registration details and we will confirm before you order.',
  },
  {
    q: 'What is included in a set?',
    a: 'A standard set covers the driver and front passenger footwells plus the rear floor. Boot liners are sold separately under the All-Weather range.',
  },
  {
    q: 'How much is delivery?',
    a: `Delivery is free on orders over ${formatPaise(BUSINESS.freeShippingOverPaise)}. Below that a flat shipping charge is shown at checkout before you pay.`,
  },
  {
    q: 'How long does dispatch take?',
    a: `Orders are cut and dispatched within ${BUSINESS.dispatchDays}. You will get a tracking link once the parcel leaves us.`,
  },
  {
    q: 'Which payment methods can I use?',
    a: 'Cards, UPI and net banking through Razorpay, and cash on delivery where available. All prices shown include GST.',
  },
  {
    q: 'Can I return a set?',
    a: `Unused sets in original packaging can be returned within ${BUSINESS.returnWindowDays} days of delivery. Because mats are cut to a specific vehicle, sets that have been fitted and used cannot be resold and are covered by the warranty instead.`,
  },
  {
    q: 'What does the warranty cover?',
    a: `${BUSINESS.warrantyYears} year against manufacturing defects — delamination, backing failure, stitching coming apart. Normal wear from use is not a defect.`,
  },
  {
    q: 'How do I clean them?',
    a: 'All-Weather trays lift out and rinse under a tap. Carbon and 7D surfaces wipe down with a damp cloth. Carpet sets should be vacuumed and spot-cleaned rather than soaked.',
  },
] as const;

export default function FaqPage() {
  return (
    <PageShell
      breadcrumb="FAQ"
      title="Frequently asked questions"
      intro="Fitment, delivery, payment and warranty. If your question is not here, ask us directly."
    >
      <dl className="divide-y divide-border">
        {FAQS.map((item) => (
          <div key={item.q} className="py-6 first:pt-0">
            <dt className="text-sm font-semibold md:text-base">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-sm text-muted-foreground">
        Still unsure?{' '}
        <Link href="/contact" className="text-accent-text underline underline-offset-4">
          Talk to us
        </Link>
        .
      </p>
    </PageShell>
  );
}
