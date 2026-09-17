'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import { frameRatioClass, type FrameRatio } from '@/components/media/editorial-frame';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { PHOTOS } from '@/features/home/photo-assets';
import type { FeaturedProduct } from '@/features/catalog/server/queries';
import { canResizeLocalImages } from '@/lib/image-loader';
import { cn } from '@/lib/utils';

type Slide = {
  src: string;
  alt: string;
  href: string;
  label: string;
  ratio: FrameRatio;
};

export function HomeGalleryShowcase({
  products,
  embedded = false,
}: {
  products: FeaturedProduct[];
  /** Gallery route: fade carousel only, no duplicate page heading block. */
  embedded?: boolean;
}) {
  const reduce = useReducedMotion();

  const shootSlides: Slide[] = PHOTOS.gallery.map((item) => ({
    src: item.src,
    alt: item.alt,
    href: SHOP_ROUTES.gallery,
    label: item.label,
    ratio: item.ratio,
  }));

  const catalogSlides: Slide[] = products
    .filter((p) => p.imageAssetId)
    .slice(0, 3)
    .map((p) => ({
      src: p.imageAssetId!,
      alt: p.imageAlt ?? `${p.name} car mat product photo`,
      href: `/products/${p.slug}`,
      label: p.name,
      ratio: '2/3' as const,
    }));

  const slides: Slide[] = shootSlides.length > 0 ? shootSlides : catalogSlides;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [reduce, slides.length]);

  if (slides.length === 0) {
    if (embedded) return <p className="text-sm text-muted-foreground">Studio photos are being updated.</p>;
    return (
      <section aria-labelledby="gallery-heading" className="band-light">
        <div className="container-page py-section text-center">
          <h2 id="gallery-heading" className="display-type text-h2">
            Product gallery
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">Studio photos are being updated.</p>
        </div>
      </section>
    );
  }

  const active = slides[index] ?? slides[0]!;

  /*
   * The selector sits beside the main frame rather than under it, and that is
   * an alignment decision before it is a styling one.
   *
   * A 2:3 plate three quarters of the column wide is 4.5 units tall; three
   * selectors one quarter wide are 1.5 units each. The strip and the plate come
   * out the same height, so the block is square at the bottom and there is
   * nothing left to fill. Stacked under the plate instead, the same content ran
   * about 1.6× taller than the plate alone — tall enough that no sane amount of
   * body copy could hold the other column up beside it.
   */
  const carousel = (
    <div className="grid grid-cols-4 gap-px bg-border">
      <div
        className={cn(
          'relative col-span-3 overflow-hidden bg-surface-elevated',
          frameRatioClass(active.ratio),
        )}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={active.src}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Link href={active.href} className="block size-full" aria-label={active.label}>
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="(max-width: 1023px) 74vw, 34vw"
                quality={88}
                unoptimized={!canResizeLocalImages}
                className="object-cover"
                priority={index === 0}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pt-16 pb-5">
                <span className="caps text-eyebrow text-white">{active.label}</span>
              </span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails rather than dots: on a picture-led page the selector should
          show the picture it selects. They stretch to the plate's height, so
          the two columns stay flush whatever the rounding. */}
      <ul
        aria-label="Gallery photographs"
        className="col-span-1 grid gap-px bg-border"
        style={{ gridTemplateRows: `repeat(${slides.length}, minmax(0, 1fr))` }}
      >
        {slides.map((slide, i) => (
          <li key={slide.src} className="relative overflow-hidden bg-surface-elevated">
            <button
              type="button"
              aria-label={`Show ${slide.label}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
              className="group absolute inset-0 block text-left"
            >
              <Image
                src={slide.src}
                alt=""
                fill
                sizes="(max-width: 1023px) 25vw, 12vw"
                quality={60}
                unoptimized={!canResizeLocalImages}
                className="object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-90 group-aria-[current=true]:opacity-100"
              />
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-0.5 origin-top bg-accent transition-motion duration-500 scale-y-0 group-aria-[current=true]:scale-y-100"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  if (embedded) return <div aria-label="Featured product photographs">{carousel}</div>;

  return (
    <section aria-labelledby="gallery-heading" className="band-light border-b border-border">
      <div className="container-page py-section">
        {/* Six and six, butted on a hairline. The text column is a full-height
            flex column, so its three blocks spread to the plate's height rather
            than clustering in the middle of it. */}
        <div className="grid gap-px bg-border lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-12 bg-surface pb-10 lg:col-span-6 lg:pr-14 lg:pb-0">
            <div>
              <p className="caps text-eyebrow text-subtle-foreground">Portfolio</p>
              <h2 id="gallery-heading" className="display-type mt-5 text-h2 text-foreground">
                Real sets, shot in studio
              </h2>
              <p className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
                What you see is the finish that ships. The shape is cut after you order, for your
                exact floorpan, so nothing here is a mock-up.
              </p>
            </div>

            <div>
              <dl className="border-t border-border">
                {[
                  ['On the shoot', 'Every range, one lighting setup'],
                  ['Retouching', 'Colour only — never the shape'],
                  ['What arrives', 'The set in the frame, cut to your car'],
                ].map(([term, detail]) => (
                  <div
                    key={term}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-4"
                  >
                    <dt className="caps text-eyebrow text-subtle-foreground">{term}</dt>
                    <dd className="text-sm text-foreground">{detail}</dd>
                  </div>
                ))}
              </dl>

              <Link
                href={SHOP_ROUTES.gallery}
                className="caps group/all mt-8 inline-flex min-h-11 w-fit items-center gap-3 text-label text-foreground transition-colors duration-300 hover:text-accent-text"
              >
                View the full gallery
                <span
                  aria-hidden
                  className="transition-motion duration-300 group-hover/all:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          <div className="bg-surface lg:col-span-6">{carousel}</div>
        </div>
      </div>
    </section>
  );
}
