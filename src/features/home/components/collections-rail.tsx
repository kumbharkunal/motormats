'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { EditorialFrame } from '@/components/media/editorial-frame';
import { COLLECTION_CARDS, collectionPath } from '@/features/catalog/routes';
import { PHOTOS } from '@/features/home/photo-assets';
import { useHorizontalRail } from '@/hooks/use-scroll-motion';

/**
 * The four ranges, as a horizontal journey.
 *
 * One render for every width and every motion preference, which is the only
 * reason the fallbacks are safe:
 *
 * - Below `md`, or with reduced motion, this is a native scroll-snap rail. The
 *   `motion-safe:md:` variants that hide the overflow are exactly the condition
 *   `useHorizontalRail` checks before it pins anything, so the rail is never
 *   left clipped with no way to reach the plates past the fold.
 * - Above `md` with motion allowed, vertical scroll is pinned and translated
 *   into horizontal travel.
 */
export function CollectionsRail() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useHorizontalRail(section, track);

  return (
    <section
      ref={section}
      aria-labelledby="ranges-heading"
      className="band-light relative flex flex-col justify-center overflow-x-hidden border-b border-border py-section motion-safe:md:h-[100svh] motion-safe:md:py-0"
    >
      <div className="container-page">
        <p className="text-eyebrow font-semibold tracking-[0.22em] text-accent uppercase">
          The ranges
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h2
            id="ranges-heading"
            className="max-w-xl display-type text-h2 text-foreground"
          >
            Four surfaces, one exact fit
          </h2>
          <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
            Every range is cut from the same scan of your floorpan. What changes is the surface you
            stand on.
          </p>
        </div>
      </div>

      <div className="native-scroll mt-10 overflow-x-auto pb-4 motion-safe:md:overflow-hidden motion-safe:md:pb-0">
        <ul
          ref={track}
          aria-label="Product ranges"
          className="flex w-max snap-x snap-mandatory plate-gap px-(--gutter-page) motion-safe:md:snap-none"
        >
          {COLLECTION_CARDS.map((range, index) => {
            const photo = PHOTOS.ranges[range.slug];

            return (
              <li
                key={range.slug}
                className="w-[74vw] shrink-0 snap-center sm:w-[46vw] md:w-[38vw] lg:w-[27vw] xl:w-[23vw]"
              >
                <Link href={collectionPath(range.slug)} className="group block">
                  <EditorialFrame
                    src={photo.src}
                    alt={photo.alt}
                    ratio={photo.ratio}
                    sizes="(max-width: 639px) 74vw, (max-width: 767px) 46vw, (max-width: 1023px) 38vw, 27vw"
                    className=""
                    imageClassName="transition-motion duration-700 ease-(--ease-smooth) group-hover:scale-[1.04]"
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-5 opacity-100 transition-opacity duration-300 ease-(--ease-smooth) md:opacity-0 md:group-hover:opacity-100"
                    >
                      <p className="text-[0.8125rem] leading-snug text-white/90">{range.body}</p>
                    </div>

                    {/* Editorial index, carrying the brand red onto the picture
                        itself. Most of what stops four dark photographs in a
                        row reading as stock. */}
                    <span
                      aria-hidden
                      className="absolute top-0 left-0 bg-accent px-2.5 py-1.5 text-eyebrow font-semibold text-white"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </EditorialFrame>

                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <h3 className="display-type text-h3 transition-colors duration-300 group-hover:text-accent">
                      {range.name}
                    </h3>
                    <ArrowRight
                      aria-hidden
                      size={18}
                      className="shrink-0 text-accent transition-motion duration-300 group-hover:translate-x-1"
                    />
                  </div>
                  <p className="mt-1 text-xs tracking-[0.12em] text-muted-foreground uppercase">
                    {range.tagline}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
