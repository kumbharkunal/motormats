'use client';

import { useRef } from 'react';

import { ArrowLink } from '@/components/editorial/arrow-link';
import { SectionIntro } from '@/components/editorial/section-intro';
import { EditorialFrame } from '@/components/media/editorial-frame';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { PHOTOS } from '@/features/home/photo-assets';
import { useEditorialReveal, useHeadlineReveal } from '@/hooks/use-scroll-motion';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    index: '01',
    name: 'Scan',
    body: 'We map the actual floorpan.',
    photo: PHOTOS.interiors.driver,
  },
  {
    index: '02',
    name: 'Engineer',
    body: 'The scan becomes a vehicle-specific pattern.',
    photo: PHOTOS.detail.radial,
  },
  {
    index: '03',
    name: 'Cut',
    body: 'Material is precision-cut to the pattern.',
    photo: PHOTOS.detail.weave,
  },
  {
    index: '04',
    name: 'Finish',
    body: 'Edges are bound and every set is inspected.',
    photo: PHOTOS.detail.badge,
  },
  {
    index: '05',
    name: 'Deliver',
    body: 'Made to order and shipped to your door.',
    photo: PHOTOS.order.trolley,
  },
];

/**
 * How a mat gets made, in five frames.
 *
 * The arrows between steps are decorative and hidden from the accessibility
 * tree — the list is already ordered and the numerals already say so, so
 * announcing four "right arrow" glyphs in the middle of it adds nothing. They
 * drop out below `lg`, where the steps become a swipe rail and the reading
 * order is left to right anyway.
 */
export function ProcessSection() {
  const scope = useRef<HTMLElement>(null);
  useEditorialReveal(scope);
  useHeadlineReveal(scope);

  return (
    <section ref={scope} aria-labelledby="process-heading" className="band-light border-b border-border">
      <div className="container-page py-section">
        <div data-reveal>
          <SectionIntro
            eyebrow="How it's made"
            titleId="process-heading"
            title={
              <>
                From floorpan
                <br />
                to finished mat.
              </>
            }
            body="Every mat starts with the actual vehicle. We scan, engineer, cut and finish around its exact contours — so it fits the way it should, not the way it can."
            action={<ArrowLink href={SHOP_ROUTES.ourStory}>Learn more</ArrowLink>}
          />
        </div>

        <ol
          data-native-scroll
          className="mt-14 -mx-5 flex native-scroll gap-4 px-5 md:mt-16 lg:mx-0 lg:grid lg:grid-cols-[repeat(5,minmax(0,1fr))] lg:gap-0 lg:px-0"
        >
          {STEPS.map((step, i) => (
            <li
              key={step.index}
              data-reveal
              className="flex min-w-[13rem] shrink-0 items-start lg:min-w-0"
            >
              <div className="flex-1">
                <EditorialFrame
                  src={step.photo.src}
                  alt={step.photo.alt}
                  ratio="2/3"
                  sizes="(max-width: 1023px) 45vw, 17vw"
                  quality={72}
                  className="aspect-[4/3]"
                />

                <p className="caps mt-4 text-eyebrow text-subtle-foreground">{step.index}</p>
                <h3 className="display-type mt-2 text-sm text-foreground">{step.name}</h3>
                <p className="mt-2 max-w-[11rem] text-xs leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>

              {/*
                Rendered on the last step too, just invisible. Every step is a
                flex row of [frame, arrow], so dropping the arrow from the last
                one gave its frame the arrow's width as well — a wider box at a
                fixed 4:3 is a taller box, and step five sat lower than the rest.
              */}
              <span
                aria-hidden
                className={cn(
                  'hidden shrink-0 self-start px-3 pt-14 text-xs text-border-strong lg:block',
                  i === STEPS.length - 1 && 'invisible',
                )}
              >
                &rarr;
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
