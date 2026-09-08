import type { Metadata } from 'next';
import Link from 'next/link';

import { BUSINESS, POLICY_UPDATED } from '@/features/marketing/business';
import { PageShell, Prose } from '@/features/marketing/components/page-shell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What Motormats collects, why, who it is shared with, and how to have it deleted.',
  alternates: { canonical: '/privacy' },
};

/**
 * The data-handling sections describe what this application genuinely does —
 * the fields are the ones in db/schema, and IP and user-agent really are stored
 * as hashes. The entity and grievance details are placeholders.
 */
export default function PrivacyPage() {
  return (
    <PageShell
      breadcrumb="Privacy Policy"
      title="Privacy policy"
      intro={`Last reviewed ${POLICY_UPDATED}.`}
    >
      <Prose>
        <h2>Who we are</h2>
        <p>
          {BUSINESS.legalName}, trading as {BUSINESS.name}, at {BUSINESS.address.line1},{' '}
          {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.postalCode},{' '}
          {BUSINESS.address.country}.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account</strong> — your phone number, and your name and email address when you
            provide them. Sign-in is handled by Firebase Authentication using a one-time password or
            a Google account.
          </li>
          <li>
            <strong>Delivery</strong> — the recipient name, phone number and postal address on each
            saved address.
          </li>
          <li>
            <strong>Orders</strong> — what you bought, the price at the time, and the delivery
            address attached to that order.
          </li>
          <li>
            <strong>Security</strong> — for each session we store a hashed session token, and a
            hashed form of your IP address and browser user agent. We do not keep the raw values.
          </li>
        </ul>

        <h2>Payments</h2>
        <p>
          Payments are processed by Razorpay. Card numbers, UPI credentials and bank details are
          entered on Razorpay&apos;s systems and never reach our servers or database. We keep only
          the payment reference and its status so we can match a payment to your order.
        </p>

        <h2>Other processors</h2>
        <ul>
          <li>Firebase Authentication (Google) — sign-in and identity verification.</li>
          <li>Razorpay — payment processing.</li>
          <li>Cloudinary — hosting and delivery of product imagery.</li>
        </ul>

        <h2>Why we hold it</h2>
        <p>
          To take and deliver your order, to let you sign in and see your order history, to meet tax
          and accounting obligations, and to protect the site against fraud and abuse. We do not
          sell personal data.
        </p>

        <h2>How long</h2>
        <p>
          Order and payment records are kept as long as tax law requires. Account and address
          details are kept until you ask us to delete them. Sessions expire on their own and are
          removed.
        </p>

        <h2>Your choices</h2>
        <p>
          You can ask for a copy of what we hold, ask us to correct it, or ask us to delete your
          account. Some records — invoices in particular — must be retained even after an account is
          closed. Write to <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
        </p>

        <h2>Cookies</h2>
        <p>
          We set a cookie to keep you signed in. Your cart is stored in your own browser, not on our
          servers, until you place an order. We do not run advertising trackers.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy go to{' '}
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>, or use the{' '}
          <Link href="/contact">contact page</Link>.
        </p>
      </Prose>
    </PageShell>
  );
}
