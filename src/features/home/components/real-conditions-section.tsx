'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { EditorialFrame } from '@/components/media/editorial-frame';
import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { PHOTOS } from '@/features/home/photo-assets';
import { useEditorialReveal, useHeadlineReveal } from '@/hooks/use-scroll-motion';

/**
 * `offset` staggers the plates by hand rather than by scroll.
 *
 * These ran on `useParallaxPlates` first. Parallax translates a frame inside a
 * band it exactly fills, so at either end of the scroll the outer two plates
 * pulled away from the band edges and left ragged strips of ink under them —
 * the movement read as a layout fault rather than as depth. A fixed offset is
 * the magazine device the mock actually uses: the centre plate breaks the line
 * and the outer two sit back from it.
 */
const CONDITIONS = [
  {
    name: 'Monsoon',
    body: 'Rain. Mud. Wet shoes.',
    photo: PHOTOS.stories.monsoon,
    offset: 'lg:mt-10',
  },
  { name: 'Dust', body: 'Sand. Everyday grime.', photo: PHOTOS.essay[0]!, offset: '' },
  {
    name: 'Everyday',
    body: 'Coffee. Kids. Life.',
    photo: PHOTOS.lifestyle.group,
    offset: 'lg:mt-5',
  },
];

/**
 * What the floor actually has to survive.
 *
 * The three plates run off the right edge of the viewport rather than stopping
 * at the container. The type column is held in the grid, so the band reads as a
 * spread that continues past the page — and because the frames are the shoot's
 * native 2:3, nothing is cropped to make that happen.
 */
export function RealConditionsSection() {
  const scope = useRef<HTMLElement>(null);
  useEditorialReveal(scope);
  useHeadlineReveal(scope);

  return (
    <section ref={scope} aria-labelledby="conditions-heading" className="screen-section band-dark overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-0">
        <div className="container-page py-section lg:mx-0 lg:ml-auto lg:max-w-[calc(var(--container-page)/2)] lg:pr-12">
          <div data-reveal>
            <p className="caps text-eyebrow text-subtle-foreground">Real world</p>
            <h2 id="conditions-heading" className="mt-5 overflow-hidden pb-[0.12em] text-h2 text-white">
              <span data-headline className="display-type block">
                Real roads.
                <br />
                Real conditions.
              </span>
            </h2>
            <p className="mt-7 max-w-sm text-body text-muted-foreground">
              From monsoons to dust to everyday commutes, your car&rsquo;s interior deals with more.
              Motormats is built for the roads we drive.
            </p>

            <Button
              asChild
              variant="hairline"
              size="caps"
              shape="square"
              className="mt-9 text-white"
            >
              <Link href={SHOP_ROUTES.collections}>
                Built for more <span aria-hidden>&rarr;</span>
              </Link>
            </Button>
          </div>
        </div>

        <ul className="grid grid-cols-3 items-start gap-px lg:gap-2">
          {CONDITIONS.map((condition) => (
            <li key={condition.name} data-reveal className={condition.offset}>
              <EditorialFrame
                src={condition.photo.src}
                alt={condition.photo.alt}
                ratio="2/3"
                sizes="(max-width: 1023px) 33vw, 17vw"
                quality={80}
                imageClassName="transition-motion duration-[1400ms] hover:scale-105"
              >
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pt-16 pb-4 md:px-5 md:pb-6">
                  <h3 className="display-type text-xs text-white md:text-sm">{condition.name}</h3>
                  <p className="mt-1.5 text-[0.6875rem] leading-snug text-white/65 md:text-xs">
                    {condition.body}
                  </p>
                </div>
              </EditorialFrame>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
