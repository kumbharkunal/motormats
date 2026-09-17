'use client';

import { Clock, PackageCheck, RefreshCw, Truck } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { BUSINESS } from '@/features/marketing/business';
import { useEditorialReveal } from '@/hooks/use-scroll-motion';
import { formatPaise } from '@/lib/money';

const ASSURANCES = [
  {
    icon: Clock,
    title: 'Cut after you order',
    body: 'Nothing sits on a shelf. Your set enters production once checkout confirms your exact trim.',
  },
  {
    icon: PackageCheck,
    title: 'Workshop QC',
    body: `Finished, checked and dispatched within ${BUSINESS.dispatchDays} from our Bikaner workshop.`,
  },
  {
    icon: Truck,
    title: 'Free shipping',
    body: `On orders over ${formatPaise(BUSINESS.freeShippingOverPaise)} anywhere in India, with tracking when it leaves.`,
  },
  {
    icon: RefreshCw,
    title: 'Fit guarantee window',
    body: `${BUSINESS.returnWindowDays} days to return an unused set if the fit is not right for your car.`,
  },
] as const;

const ORDER_STEPS = [
  { num: '01', title: 'You order', detail: 'Make, model, year and design locked at checkout.' },
  { num: '02', title: 'We cut', detail: 'Pattern pulled from your generation and cut on CNC.' },
  { num: '03', title: 'We ship', detail: 'Packed as a full set with install notes in the box.' },
] as const;

/**
 * Made to order — redesigned.
 *
 * Clean vertical timeline for steps, followed by a 2x2 assurance card grid.
 * No photos — the copy carries the argument on its own, and the section
 * reads cleanly on both mobile and desktop.
 */
export function AssurancePanel() {
  const scope = useRef<HTMLElement>(null);
  useEditorialReveal(scope);

  return (
    <section ref={scope} aria-labelledby="assurance-heading" className="screen-section band-dark border-y border-white/10">
      <div className="container-page py-section">
        {/* Header */}
        <div data-reveal className="max-w-2xl">
          <p className="text-eyebrow font-semibold tracking-[0.22em] text-accent uppercase">
            Made to order
          </p>
          <h2
            id="assurance-heading"
            className="mt-4 display-type text-h2 text-white"
          >
            Made to order, backed after it arrives
          </h2>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-white/60 md:text-base">
            One production run per car. Support that starts when tracking goes live, not when
            something goes wrong.
          </p>
        </div>

        {/* Steps timeline */}
        <ol className="mt-10 grid gap-0 md:mt-14 md:grid-cols-3 md:gap-5">
          {ORDER_STEPS.map((step, i) => (
            <li
              key={step.num}
              data-reveal
              className="relative flex gap-5 pb-8 md:flex-col md:gap-0 md:pb-0"
            >
              {/* Vertical line connector (mobile only) */}
              {i < ORDER_STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="absolute top-10 left-[1.0625rem] bottom-0 w-px bg-accent/30 md:hidden"
                />
              )}

              {/* Step number circle */}
              <div className="relative z-10 flex size-[2.125rem] shrink-0 items-center justify-center rounded-full border-2 border-accent bg-accent/10 text-xs font-bold tabular-nums text-accent md:mb-5">
                {step.num}
              </div>

              <div className="flex-1 pt-1 md:pt-0">
                {/* Horizontal accent bar (desktop only) */}
                <div aria-hidden className="mb-4 hidden h-px bg-accent/25 md:block" />
                <h3 className="display-type text-base text-white md:text-lg">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/50">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Assurance cards */}
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:mt-12">
          {ASSURANCES.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              data-reveal
              className="rounded-xl border border-white/10 bg-white/[0.04] p-5 transition-colors duration-500 hover:border-accent/30 md:p-6"
            >
              <span className="mb-4 flex size-11 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 md:mb-5">
                <Icon aria-hidden strokeWidth={1.5} className="size-5 text-accent" />
              </span>
              <h3 className="display-type text-sm text-white">{title}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-white/50">{body}</p>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div data-reveal className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:mt-10">
          <Button asChild variant="flat" size="caps" shape="square" className="w-full sm:w-auto">
            <Link href={SHOP_ROUTES.findYourFit}>Start your order</Link>
          </Button>
          <Button asChild variant="hairline" size="caps" shape="square" className="w-full text-white sm:w-auto">
            <Link href={SHOP_ROUTES.shippingReturns}>Shipping and returns</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
