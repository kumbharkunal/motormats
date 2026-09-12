import { PackageCheck, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { BUSINESS } from '@/features/marketing/business';
import { SectionHeading } from '@/features/home/components/section-heading';
import { formatPaise } from '@/lib/money';

/**
 * The buying-assurance band.
 *
 * The reference runs a customer-review wall here. We cannot: there is no
 * reviews table, and the `ratingSum`/`ratingCount` columns are seeded demo
 * values, so any testimonial or aggregate shown would be invented. This states
 * only what the business already commits to elsewhere on the site, every figure
 * read from `BUSINESS` so it cannot drift from the FAQ and policy pages.
 *
 * Deliberately the one dark band in the page. It closes the scroll against the
 * footer, answers the hero at the other end, and breaks up a run of white
 * sections that otherwise reads as one undifferentiated sheet — the same
 * dark-island device the admin sign-in uses inside its light theme.
 *
 * When real reviews exist, this is the panel they replace.
 */
const ASSURANCES = [
  {
    icon: Truck,
    title: 'Free shipping',
    body: `On every order over ${formatPaise(BUSINESS.freeShippingOverPaise)}, anywhere in India.`,
  },
  {
    icon: PackageCheck,
    title: 'Dispatched fast',
    body: `Cut, finished and on its way within ${BUSINESS.dispatchDays}.`,
  },
  {
    icon: RefreshCw,
    title: 'Easy returns',
    body: `${BUSINESS.returnWindowDays} days to return an unused set if the fit is not right.`,
  },
  {
    icon: ShieldCheck,
    title: 'Warranty',
    body: `${BUSINESS.warrantyYears} year against manufacturing defects, no questions.`,
  },
] as const;

export function AssurancePanel() {
  return (
    <section aria-labelledby="assurance-heading" className="relative overflow-hidden bg-foreground">
      {/* A single red bloom off the top-left corner, at the low alpha a
          saturated red needs on a dark ground to read as light rather than
          paint. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(120% 90% at 8% 0%, rgba(225,6,0,0.20) 0%, rgba(225,6,0,0) 55%)',
        }}
      />
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-accent/60" />

      <div className="relative container-page py-section">
        <SectionHeading
          id="assurance-heading"
          eyebrow="Ordering"
          title="Made to order, backed after it arrives"
          body="Cut for your exact model once you order — and covered from the moment it ships."
          tone="light"
        />

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:mt-16 lg:grid-cols-4">
          {ASSURANCES.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors duration-500 hover:border-accent/40 md:p-6"
            >
              <span className="mb-4 flex size-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 md:mb-5">
                <Icon aria-hidden strokeWidth={1.5} className="size-5 text-accent-on-dark" />
              </span>
              <h3 className="text-sm font-semibold text-white md:text-base">{title}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-white/60">{body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:mt-14">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/collections">Find your fit</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="w-full border-white/25 bg-white/5 text-white hover:border-white hover:bg-white/15 sm:w-auto"
          >
            <Link href="/shipping-and-returns">Shipping &amp; returns</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
