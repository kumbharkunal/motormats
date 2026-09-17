import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { EditorialFrame } from '@/components/media/editorial-frame';
import { ProductCard } from '@/features/catalog/components/product-card';
import type { FeaturedProduct } from '@/features/catalog/server/queries';
import { cn } from '@/lib/utils';

/**
 * A split band: a captioned photograph on one side, a 2x2 product grid on the
 * other.
 *
 * `reverse` mirrors the two halves so consecutive zones alternate, which is how
 * the reference keeps a long page from reading as a list. It swaps the grid
 * order rather than rendering a second layout, so there is still exactly one
 * copy of each child in the DOM.
 */
export function ProductZone({
  id,
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  ctaHref,
  ctaLabel,
  products,
  reverse = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  ctaHref: string;
  ctaLabel: string;
  products: FeaturedProduct[];
  reverse?: boolean;
}) {
  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId} className={cn('screen-section', reverse ? 'band-dark' : 'band-light')}>
      <div className="relative container-page py-section">
        {/* Stretch is safe here only because the frame drops its aspect ratio at
            `lg` (below). While it kept one, a stretched item resolved its
            *width* from the row height and pushed the photograph past its
            column; capping the height instead shrank the width the same way and
            opened a gutter down the middle of the band. With no ratio to
            satisfy, the plate simply fills its half. */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          {/*
            2:3 below `lg`, where the plate stacks above the cards and sets its
            own height — the shoot is portrait at that ratio, so any other frame
            would have to trim it.

            At `lg` the ratio drops and the frame instead stretches to match the
            card grid beside it (`items-stretch` on the parent, no `items-start`
            here). A capped-height 2:3 plate resolves its *width* from the cap,
            which left it narrower than its column and opened the band's middle
            gutter; matching the grid's real height first and cropping into
            *that* is what actually uses the space.
          */}
          <EditorialFrame
            src={image}
            alt={imageAlt}
            ratio="2/3"
            sizes="(max-width: 1023px) 100vw, 45vw"
            className={cn('lg:aspect-auto lg:h-full', reverse && 'lg:order-2')}
          >
            {/* Caption over the top of the frame, on a scrim that fades out
                downward — the reference's own arrangement, and the reason the
                photography is briefed with clear space at the top. */}
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent p-6 pb-16 md:p-8 md:pb-20">
              <p className="flex items-center gap-3 text-eyebrow font-semibold text-accent-on-dark uppercase">
                <span aria-hidden className="h-px w-6 bg-accent" />
                {eyebrow}
              </p>
              <h2 id={headingId} className="display-type mt-4 text-h2 text-white">
                {title}
              </h2>
              <p className="mt-4 max-w-md text-[0.8125rem] leading-relaxed text-white/70">{body}</p>
            </div>
          </EditorialFrame>

          <div className={cn('flex flex-col', reverse && 'lg:order-1')}>
            {products.length > 0 ? (
              <ul className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {products.map((product) => (
                  <li key={product.publicId}>
                    <ProductCard product={product} dense />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Our ranges are loading. Browse the full catalogue below.
              </p>
            )}

            <Link
              href={ctaHref}
              className="caps group mt-6 inline-flex min-h-13 items-center justify-between gap-6 self-center bg-accent px-7 text-label text-white transition-colors duration-300 hover:bg-accent-hover lg:self-start"
            >
              {ctaLabel}
              <ArrowRight
                aria-hidden
                size={16}
                className="shrink-0 transition-motion duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
