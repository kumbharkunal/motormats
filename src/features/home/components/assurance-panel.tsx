'use client';

import { Clock, PackageCheck, RefreshCw, Truck } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { EditorialFrame, FrameCaption } from '@/components/media/editorial-frame';
import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { BUSINESS } from '@/features/marketing/business';
import { PHOTOS } from '@/features/home/photo-assets';
import { useEditorialReveal, useParallaxPlates } from '@/hooks/use-scroll-motion';
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
  { title: 'You order', detail: 'Make, model, year and design locked at checkout.' },
  { title: 'We cut', detail: 'Pattern pulled from your generation and cut on CNC.' },
  { title: 'We ship', detail: 'Packed as a full set with install notes in the box.' },
] as const;

/**
 * Made to order.
 *
 * The three steps used to be three text cards in a row. They now run beside two
 * plates of the sets actually leaving the workshop, because "cut after you
 * order" is a claim in text and a fact in a photograph of a loaded trolley.
 */
export function AssurancePanel() {
  const scope = useRef<HTMLElement>(null);

  useEditorialReveal(scope);
  useParallaxPlates(scope);

  return (
    <section ref={scope} aria-labelledby="assurance-heading" className="band-light border-y border-border">
      <div className="container-page py-section">
        <div className="max-w-2xl">
          <p data-reveal className="text-eyebrow font-semibold tracking-[0.22em] text-accent uppercase">
            Made to order
          </p>
          <h2
            id="assurance-heading"
            data-reveal
            className="mt-4 display-type text-h2 text-foreground"
          >
            Made to order, backed after it arrives
          </h2>
          <p data-reveal className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
            One production run per car. Support that starts when tracking goes live, not when
            something goes wrong.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12 lg:mt-16">
          <div data-parallax="1" className="lg:col-span-4">
            <EditorialFrame
              {...PHOTOS.order.trolley}
              sizes="(max-width: 1023px) 100vw, 32vw"
              className=""
            />
            <FrameCaption index="01">Finished sets leaving the workshop floor.</FrameCaption>
          </div>

          <ol className="flex flex-col justify-center gap-4 lg:col-span-4">
            {ORDER_STEPS.map((step, index) => (
              <li
                key={step.title}
                data-reveal
                className="border border-border bg-surface p-6"
              >
                <span className="text-eyebrow font-semibold tracking-[0.18em] text-accent uppercase">
                  Step {index + 1}
                </span>
                <h3 className="display-type mt-3 text-h3 text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
              </li>
            ))}
          </ol>

          <div data-parallax="2.5" className="lg:col-span-4">
            <EditorialFrame
              {...PHOTOS.order.stack}
              sizes="(max-width: 1023px) 100vw, 32vw"
              className=""
            />
            <FrameCaption index="02">Packed as a set, with install notes in the box.</FrameCaption>
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {ASSURANCES.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              data-reveal
              className="border border-border bg-surface p-5 transition-colors duration-500 hover:border-accent/30 md:p-6"
            >
              <span className="mb-4 flex size-11 items-center justify-center border border-accent/20 bg-accent/5 md:mb-5">
                <Icon aria-hidden strokeWidth={1.5} className="size-5 text-accent" />
              </span>
              <h3 className="display-type text-sm text-foreground">{title}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>

        <div data-reveal className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:mt-14">
          <Button asChild variant="flat" size="caps" shape="square" className="w-full sm:w-auto">
            <Link href={SHOP_ROUTES.findYourFit}>Start your order</Link>
          </Button>
          <Button asChild variant="hairline" size="caps" shape="square" className="w-full sm:w-auto">
            <Link href={SHOP_ROUTES.shippingReturns}>Shipping and returns</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
