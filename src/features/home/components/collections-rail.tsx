import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { COLLECTION_CARDS, collectionPath } from '@/features/catalog/routes';
import { SectionHeading } from '@/features/home/components/section-heading';

export function CollectionsRail() {
  return (
    <section aria-labelledby="ranges-heading" className="band-light">
      <div className="relative container-page py-section">
        <SectionHeading
          id="ranges-heading"
          eyebrow="The ranges"
          title="Four surfaces, one exact fit"
          body="Every range is cut from the same scan of your floorpan. What changes is the surface you stand on."
        />

        {/* One render for every width: a snap rail that becomes a four-up grid,
            rather than a mobile and a desktop copy of the same four tiles. */}
        <ul
          className="native-scroll -mx-5 mt-12 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-5 pb-4 [-ms-overflow-style:none] md:mt-16 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
          data-native-scroll
          aria-label="Product ranges"
        >
          {COLLECTION_CARDS.map((range, index) => (
            <li
              key={range.slug}
              className="w-[70%] max-w-[19rem] shrink-0 snap-center sm:w-[46%] lg:w-auto lg:max-w-none"
            >
              <Link href={collectionPath(range.slug)} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-elevated">
                  <Image
                    src={range.image}
                    alt={`${range.name} car mats fitted in a car interior`}
                    fill
                    sizes="(max-width: 639px) 70vw, (max-width: 1023px) 46vw, 22vw"
                    className="object-cover transition-motion duration-500 ease-(--ease-smooth) group-hover:scale-105"
                  />

                  {/* The reference darkens the photo itself on hover. A filter
                      is not a compositor property, so the same read is built
                      from an overlay's opacity instead. */}
                  <div
                    aria-hidden
                    className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/25 to-transparent p-4 opacity-100 transition-opacity duration-300 ease-(--ease-smooth) md:opacity-0 md:group-hover:opacity-100"
                  >
                    <p className="text-[0.8125rem] leading-snug text-white/90">{range.body}</p>
                  </div>

                  {/* Editorial index. Carries the brand red onto the image
                      itself, which is most of what stops a grid of four dark
                      photographs reading as stock. */}
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 bg-accent px-2.5 py-1.5 text-eyebrow font-semibold text-white"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="text-h3 transition-colors duration-300 group-hover:text-accent">
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
          ))}
        </ul>
      </div>
    </section>
  );
}
