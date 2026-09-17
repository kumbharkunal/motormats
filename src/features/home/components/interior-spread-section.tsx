'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { EditorialFrame } from '@/components/media/editorial-frame';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { PHOTOS } from '@/features/home/photo-assets';
import { useEditorialReveal, useParallaxPlates } from '@/hooks/use-scroll-motion';

const PLATES = [
  { photo: PHOTOS.interiors.wide, depth: '1', caption: 'Fitted, seen from the passenger side' },
  { photo: PHOTOS.interiors.driver, depth: '2.5', caption: 'The driver footwell, flush under the pedals' },
  { photo: PHOTOS.lifestyle.table, depth: '1.5', caption: 'The same weave, off the floor' },
] as const;

/**
 * The full-bleed spread.
 *
 * No container and no vertical padding: three plates run to the edges of the
 * viewport with only a magazine gutter between them. This is the section that
 * removes the dead space — inside the 1340px column these three photographs
 * left a band of empty ground down both sides of a wide screen.
 *
 * The caption bar is the only thing here that stays in the text column, which
 * is the arrangement that keeps a full-bleed spread from reading as a banner.
 */
export function InteriorSpreadSection() {
  const scope = useRef<HTMLElement>(null);

  useEditorialReveal(scope);
  useParallaxPlates(scope);

  return (
    <section ref={scope} aria-labelledby="spread-heading" className="band-dark overflow-hidden">
      <h2 id="spread-heading" className="sr-only">
        Motormats sets photographed in the cabin
      </h2>

      {/* `py` on the plates themselves, not the section: the parallax drift
          needs a little ground above and below or the topmost plate shows a
          seam as it leaves. */}
      <ul className="full-bleed grid plate-gap py-2 md:grid-cols-3">
        {PLATES.map(({ photo, depth, caption }) => (
          <li key={photo.src} data-parallax={depth}>
            <EditorialFrame
              src={photo.src}
              alt={photo.alt}
              ratio={photo.ratio}
              sizes="(max-width: 767px) 100vw, 33vw"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pt-20 pb-5"
              >
                <p className="text-[0.8125rem] leading-snug text-white/85">{caption}</p>
              </div>
            </EditorialFrame>
          </li>
        ))}
      </ul>

      <div className="container-page py-band">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p
            data-reveal
            className="max-w-2xl text-[clamp(1.25rem,2.2vw,1.875rem)] leading-[1.25] tracking-[-0.01em] text-white"
          >
            People spend more time in their cars than in most rooms of their house, and decorate
            precisely none of it.
          </p>
          <Link
            data-reveal
            href={SHOP_ROUTES.collections}
            className="inline-flex min-h-11 w-fit shrink-0 items-center border-b border-accent text-sm font-semibold text-white transition-colors duration-300 hover:text-accent"
          >
            Shop collections
          </Link>
        </div>
      </div>
    </section>
  );
}
