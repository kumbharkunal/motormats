'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { PHOTOS } from '@/features/home/photo-assets';
import { canResizeLocalImages } from '@/lib/image-loader';
import { useEditorialReveal, useHeadlineReveal } from '@/hooks/use-scroll-motion';

const CLAIMS = ['Better materials', 'A brighter interior', 'A more interesting floor'];

/**
 * The last thing on the page before the footer.
 *
 * Same construction as the cover, deliberately: ink, type left, photography
 * bleeding off the right. The page opens and closes on the same shape, and the
 * reader who scrolled the whole way arrives back where they started with one
 * button instead of two.
 */
export function ClosingCta() {
  const scope = useRef<HTMLElement>(null);
  useEditorialReveal(scope);
  useHeadlineReveal(scope);

  return (
    <section ref={scope} aria-labelledby="closing-heading" className="screen-section band-dark relative overflow-hidden">
      <div aria-hidden className="absolute inset-y-0 right-0 z-0 w-full lg:w-[58%]">
        <Image
          src={PHOTOS.cover.src}
          alt=""
          fill
          sizes="(max-width: 1023px) 100vw, 58vw"
          quality={82}
          unoptimized={!canResizeLocalImages}
          className="object-cover object-center"
        />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 z-1 bg-ink/75 lg:bg-gradient-to-r lg:from-ink lg:via-ink/85 lg:via-40% lg:to-transparent lg:to-75%"
      />

      <div className="container-page relative z-10 py-section">
        <div data-reveal className="max-w-2xl lg:max-w-[48%]">
          <p className="caps text-eyebrow text-white/50">Motormats</p>
          <h2 id="closing-heading" className="mt-5 overflow-hidden pb-[0.12em] text-h1 text-white">
            <span data-headline className="display-type block">
              Your car deserves better.
            </span>
          </h2>

          <Button asChild variant="flat" size="caps" shape="square" className="mt-9">
            <Link href={SHOP_ROUTES.findYourFit}>
              Find your fit <span aria-hidden>&rarr;</span>
            </Link>
          </Button>
        </div>

        <ul
          data-reveal
          className="mt-14 flex flex-col gap-2 lg:absolute lg:top-1/2 lg:right-0 lg:mt-0 lg:max-w-[9rem] lg:-translate-y-1/2 lg:pr-(--gutter-page)"
        >
          {CLAIMS.map((claim) => (
            <li key={claim} className="caps text-eyebrow leading-[1.9] text-white/55">
              {claim}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
