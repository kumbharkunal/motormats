'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { EditorialFrame } from '@/components/media/editorial-frame';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { PHOTOS } from '@/features/home/photo-assets';
import { useEditorialReveal, useParallaxPlates } from '@/hooks/use-scroll-motion';

/**
 * The opening spread: two plates and the standfirst set between them.
 *
 * The plates drift at different depths (`data-parallax`), which is what stops
 * three columns of equal height reading as a row of cards. The frames
 * themselves move; the photographs inside them are never scaled past their
 * frame, so nothing is cropped.
 */
export function CoverStorySection() {
  const scope = useRef<HTMLElement>(null);

  useEditorialReveal(scope);
  useParallaxPlates(scope);

  return (
    <section
      ref={scope}
      aria-labelledby="cover-story-heading"
      className="band-light border-b border-border"
    >
      <div className="container-page py-section">
        <div
          data-reveal
          className="flex items-baseline justify-between gap-6 border-b border-border pb-5"
        >
          <p className="text-eyebrow font-semibold tracking-[0.22em] text-accent uppercase">
            Issue 01
          </p>
          <p className="text-[0.8125rem] text-muted-foreground">Woven, not printed</p>
        </div>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div data-parallax="1" className="lg:col-span-5">
            <EditorialFrame
              {...PHOTOS.detail.badge}
              sizes="(max-width: 1023px) 100vw, 40vw"
              className=""
            />
          </div>

          <div className="flex flex-col justify-center lg:col-span-4">
            <h2
              id="cover-story-heading"
              data-reveal
              className="display-type text-h2 text-foreground"
            >
              Every car mat in the country looks the same.
            </h2>
            <p
              data-reveal
              className="mt-6 max-w-[38ch] text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base"
            >
              Rubber is cheap, it moulds fast, and it never had competition. Motormats is woven to
              your floorpan instead: one pattern per car, finished at the edge by hand.
            </p>
            <Link
              data-reveal
              href={SHOP_ROUTES.ourStory}
              className="mt-8 inline-flex min-h-11 w-fit items-center border-b border-accent text-sm font-semibold text-foreground transition-colors duration-300 hover:text-accent"
            >
              Read how it is made
            </Link>
          </div>

          <div data-parallax="2.5" className="lg:col-span-3">
            <EditorialFrame
              {...PHOTOS.detail.crest}
              sizes="(max-width: 1023px) 100vw, 24vw"
              className=""
            />
          </div>
        </div>
      </div>
    </section>
  );
}
