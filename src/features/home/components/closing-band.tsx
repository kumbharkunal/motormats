'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { PhotoPlate } from '@/components/media/photo-plate';
import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { PHOTOS } from '@/features/home/photo-assets';
import { photoCutFor } from '@/features/home/photo-grid';
import { BUSINESS } from '@/features/marketing/business';
import { useEditorialReveal, useHeadlineReveal } from '@/hooks/use-scroll-motion';
import { formatPaise } from '@/lib/money';

/**
 * The close, and the reassurance that used to be its own band.
 *
 * `assurance-panel` sat immediately above `closing-cta`: two consecutive ink
 * screens, one asking for the sale and one answering the objections to it. They
 * are the same moment, so they are the same band — the promises run as a
 * hairline row beneath the call to action rather than delaying it by a screen.
 *
 * **The photograph is a plate, not a backdrop.** It used to be full-bleed under
 * a 70% ink wash, and the frame underneath is a dim cabin interior to begin
 * with: the result was a black rectangle that still cost the bytes of a
 * photograph nobody could make out, with the headline floating on it. Sitting
 * the same frame in its own column at full strength means the picture is
 * actually legible and the type is on solid ink where white belongs — both jobs
 * done properly instead of one compromise doing neither.
 *
 * On a phone there is no room for two columns, so the plate leads and the copy
 * follows it. Nothing is hidden at any width; the image is the argument.
 */
const CLAIMS = ['Better materials', 'A brighter interior', 'A more interesting floor'];

const PROMISES = [
  {
    title: 'Cut after you order',
    body: 'Nothing sits on a shelf. Your set enters production once checkout confirms your exact trim.',
  },
  {
    title: 'Workshop QC',
    body: `Finished, checked and dispatched within ${BUSINESS.dispatchDays} from our Bikaner workshop.`,
  },
  {
    title: 'Free shipping',
    body: `On orders over ${formatPaise(BUSINESS.freeShippingOverPaise)} anywhere in India, with tracking when it leaves.`,
  },
  {
    title: 'Fit guarantee window',
    body: `${BUSINESS.returnWindowDays} days to return an unused set if the fit is not right for your car.`,
  },
];

export function ClosingBand() {
  const scope = useRef<HTMLElement>(null);
  const cut = photoCutFor(PHOTOS.interiors.wide.src);

  useEditorialReveal(scope);
  useHeadlineReveal(scope);

  return (
    <section ref={scope} aria-labelledby="closing-heading" className="band-dark relative">
      <div className="container-page py-section">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/*
            Order matters at each width and they disagree: the picture leads on a
            phone because it is the argument, and sits on the right on a desktop
            because the copy owns the reading edge. One render, two orders.
          */}
          {cut ? (
            <div data-reveal className="lg:order-2 lg:col-span-5">
              <div className="relative aspect-4/5 overflow-hidden sm:aspect-3/2 lg:aspect-4/5">
                <PhotoPlate
                  {...cut}
                  alt={PHOTOS.interiors.wide.alt}
                  sizes="(max-width: 1023px) 92vw, 40vw"
                />
              </div>
            </div>
          ) : null}

          <div data-reveal className="lg:order-1 lg:col-span-7">
            <p className="caps text-eyebrow text-accent-on-dark">Motormats</p>

            <h2 id="closing-heading" className="mt-5 overflow-hidden pb-[0.12em] text-h1 text-white">
              <span data-headline className="display-type block">
                Your car deserves better.
              </span>
            </h2>

            {/*
              A row with rules between, like the cover's spec line. Stacked as
              three lines of tracked micro-caps they read as leftover list items;
              set across with hairlines they read as a claim.
            */}
            <ul className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              {CLAIMS.map((claim, index) => (
                <li key={claim} className="flex items-center gap-4">
                  {index > 0 ? (
                    <span aria-hidden className="hidden h-3 w-px bg-white/25 sm:block" />
                  ) : null}
                  <span className="caps text-eyebrow text-white/65">{claim}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="flat" size="caps" shape="square">
                <Link href={SHOP_ROUTES.findYourFit}>
                  Find your fit <span aria-hidden>&rarr;</span>
                </Link>
              </Button>
              <Button asChild variant="hairline" size="caps" shape="square" className="text-white">
                <Link href={SHOP_ROUTES.collections}>Explore materials</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* The four promises, as a hairline row rather than a screen of their own. */}
        <ul
          data-reveal
          className="mt-16 grid gap-x-10 gap-y-8 border-t border-white/12 pt-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PROMISES.map((promise) => (
            <li key={promise.title}>
              <h3 className="caps text-eyebrow text-white">{promise.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{promise.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
