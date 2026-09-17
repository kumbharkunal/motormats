'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [reduce, slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) next();
      else prev();
    }
    touchStart.current = null;
  }, [next, prev]);

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

  /* ── Carousel (shared between embedded and full mode) ─────────────── */
  const carousel = (
    <div
      className="relative overflow-hidden rounded-xl md:rounded-2xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main image */}
      <div
        className={cn(
          'relative overflow-hidden bg-surface-elevated',
          frameRatioClass(active.ratio),
          'aspect-[3/4] sm:aspect-[4/5] lg:aspect-[2/3]',
        )}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={active.src}
            initial={reduce ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Link href={active.href} className="block size-full" aria-label={active.label}>
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="(max-width: 1023px) 90vw, 45vw"
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

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show ${slide.label}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index
                  ? 'w-6 bg-accent'
                  : 'w-1.5 bg-foreground/20 hover:bg-foreground/40',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (embedded) return <div aria-label="Featured product photographs">{carousel}</div>;

  return (
    <section aria-labelledby="gallery-heading" className="screen-section band-light border-b border-border">
      <div className="container-page py-section">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          {/* Text column */}
          <div className="flex flex-col justify-between gap-8 lg:sticky lg:top-24">
            <div>
              <p className="caps text-eyebrow text-subtle-foreground">Portfolio</p>
              <h2 id="gallery-heading" className="display-type mt-4 text-h2 text-foreground lg:mt-5">
                Real sets, shot in studio
              </h2>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base lg:mt-6">
                What you see is the finish that ships. The shape is cut after you order, for your
                exact floorpan, so nothing here is a mock-up.
              </p>
            </div>

            <div className="hidden lg:block">
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

          {/* Carousel column */}
          <div>{carousel}</div>

          {/* Mobile-only CTA */}
          <div className="text-center lg:hidden">
            <Link
              href={SHOP_ROUTES.gallery}
              className="caps group/all inline-flex min-h-11 items-center gap-3 text-label text-foreground transition-colors duration-300 hover:text-accent-text"
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
      </div>
    </section>
  );
}
