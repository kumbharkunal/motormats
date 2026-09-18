import type { Metadata } from 'next';
import Link from 'next/link';

import { MatPlate } from '@/components/media/mat-plate';
import { PhotoPlate } from '@/components/media/photo-plate';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { matCutoutForAsset } from '@/features/catalog/mat-cutouts';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { listProducts } from '@/features/catalog/server/queries';
import { HERO_SLIDES } from '@/features/home/hero-slides';
import { PHOTOS, type Photo } from '@/features/home/photo-assets';
import { photoCutFor } from '@/features/home/photo-grid';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'The Motormats shoot — the ranges on location in Rajasthan, the weaves at close range, and every mat in the catalogue photographed flat.',
  alternates: { canonical: '/gallery' },
};

export const revalidate = 3600;

/**
 * The gallery.
 *
 * **Three movements, not one grid.** The page this replaces rendered the
 * homepage's showcase component and then a second grid of the same products
 * underneath it, so the same photographs appeared twice; it also cropped
 * transparent mat cutouts with `object-cover`, which guillotines them, and wore
 * `rounded-3xl` on a site whose `--radius-card` is 0. Here the photography, the
 * location frames and the catalogue are three distinct passes, each shown at the
 * shape it was made in.
 *
 * **Every frame is portrait 2:3**, which is a constraint rather than a choice —
 * the whole shoot is. A grid of one ratio would drone, so the two landscape
 * bands lifted from the cover break it up; they are already built and already
 * being fetched by anyone who has seen the homepage.
 */

type Plate = { photo: Photo; caption: string };

const plate = (photo: Photo, caption: string): Plate => ({ photo, caption });

/** On location: the shoot, in the order it reads best. */
const LOCATION: Plate[] = [
  plate(PHOTOS.essay[0]!, 'Jaipur'),
  plate(PHOTOS.gallery[0]!, 'The green Ambassador'),
  plate(PHOTOS.essay[3]!, 'Painted door'),
  plate(PHOTOS.essay[1]!, 'Stone muse'),
  plate(PHOTOS.gallery[1]!, 'Heritage facade'),
  plate(PHOTOS.essay[2]!, 'Headlight'),
  plate(PHOTOS.gallery[2]!, 'Sandstone'),
  plate(PHOTOS.lifestyle.group, 'The courtyard'),
];

/** In the car: what a fitted set actually looks like. */
const FITTED: Plate[] = [
  plate(PHOTOS.interiors.wide, 'Across the cabin'),
  plate(PHOTOS.interiors.driver, 'Driver footwell'),
  plate(PHOTOS.ranges['7d-luxury'], '7D Luxury'),
  plate(PHOTOS.ranges.carbon, 'Carbon Series'),
  plate(PHOTOS.ranges.carpet, 'Executive Carpet'),
  plate(PHOTOS.ranges['all-weather'], 'All-Weather'),
  plate(PHOTOS.essay[4]!, 'In the cabin'),
  plate(PHOTOS.zones.madeToFit, 'Cut to the footwell'),
];

/** Close up: the weave, the binding, the badge. */
const DETAIL: Plate[] = [
  plate(PHOTOS.detail.weave, 'The pile'),
  plate(PHOTOS.detail.badge, 'The badge'),
  plate(PHOTOS.detail.radial, 'Radial weave'),
  plate(PHOTOS.detail.stack, 'Bound edge'),
  plate(PHOTOS.detail.crest, 'Beside the crest'),
  plate(PHOTOS.essay[5]!, 'Perforated'),
  plate(PHOTOS.order.stack, 'Rolled for delivery'),
  plate(PHOTOS.order.trolley, 'Leaving the workshop'),
];

const GRID_SIZES = '(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw';

export default async function GalleryPage() {
  // Every product, not just the featured ones — the catalogue strip is meant to
  // be the whole catalogue, and `listFeaturedProducts` returns only the handful
  // flagged in the seed.
  const { items: products } = await listProducts({ perPage: 24 }).catch(() => ({ items: [] }));

  return (
    <div className="pb-20 md:pb-28">
      <header className="container-page pt-10 pb-12 md:pt-14 md:pb-16">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]} />
        <h1 className="mt-6 text-h1">Gallery</h1>
        <p className="mt-4 max-w-xl text-balance text-muted-foreground md:text-lg">
          The shoot, in full. Every set is cut per vehicle, so the finish here is the finish that
          arrives — only the shape changes.
        </p>
      </header>

      <PlateSection id="on-location" eyebrow="On location" title="Rajasthan" plates={LOCATION} priority />

      <CoverBand slug="dune-toss" />

      <PlateSection id="fitted" eyebrow="In the car" title="Fitted" plates={FITTED} />

      <CoverBand slug="jaipur-railing" />

      <PlateSection id="detail" eyebrow="Close up" title="The making" plates={DETAIL} />

      <section aria-labelledby="catalogue-heading" className="band-light border-t border-border">
        <div className="container-page py-section">
          <SectionHead
            id="catalogue-heading"
            eyebrow="Every mat"
            title="The catalogue"
          />

          {products.length === 0 ? (
            <p className="mt-10 border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
              Photography is being updated. Please check back shortly.
            </p>
          ) : (
            <ul className="mt-10 grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const cutout = matCutoutForAsset(product.imageAssetId);

                return (
                  <li key={product.publicId} className="bg-surface">
                    <Link
                      href={`/products/${product.slug}`}
                      className="group block focus-visible:outline-offset-[-2px]"
                    >
                      {/* Paper under the plate, padded, `object-contain`: these
                          are transparent cutouts and the ground is the card's. */}
                      <div className="aspect-4/5 bg-paper p-5 md:p-7">
                        {cutout ? (
                          <MatPlate
                            {...cutout}
                            alt={product.imageAlt ?? cutout.alt}
                            sizes={GRID_SIZES}
                            className="drop-shadow-[0_14px_22px_rgba(10,10,10,0.12)] transition-motion duration-700 ease-expo group-hover:-translate-y-1.5"
                          />
                        ) : null}
                      </div>
                      <p className="border-t border-border p-4 text-sm text-foreground transition-colors duration-200 group-hover:text-accent-text">
                        {product.name}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="flat" size="caps" shape="square">
              <Link href={SHOP_ROUTES.collections}>Shop the ranges</Link>
            </Button>
            <Button asChild variant="hairline" size="caps" shape="square">
              <Link href={SHOP_ROUTES.findYourFit}>Find your fit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-border pb-5">
      <h2 id={id} className="display-type text-h2 text-foreground">
        {title}
      </h2>
      <p className="caps text-eyebrow text-subtle-foreground">{eyebrow}</p>
    </div>
  );
}

/**
 * One movement of the gallery.
 *
 * `gap-px` over a `bg-border` ground draws the hairline rules between tiles as
 * the gaps themselves, so there is exactly one pixel between neighbours instead
 * of two borders meeting.
 */
function PlateSection({
  id,
  eyebrow,
  title,
  plates,
  priority = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  plates: Plate[];
  priority?: boolean;
}) {
  return (
    <section aria-labelledby={id} className="container-page pb-16 md:pb-20">
      <SectionHead id={id} eyebrow={eyebrow} title={title} />

      <ul className="mt-8 grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4">
        {plates.map(({ photo, caption }, index) => {
          const cut = photoCutFor(photo.src);
          if (!cut) return null;

          return (
            <li key={photo.src} className="group relative aspect-[2/3] overflow-hidden bg-surface">
              <PhotoPlate
                {...cut}
                alt={photo.alt}
                sizes={GRID_SIZES}
                priority={priority && index < 4}
                className="transition-motion duration-700 ease-expo group-hover:scale-[1.04]"
              />

              {/* The caption rides its own wash so it stays legible over a pale
                  frame and a dark one alike, and only appears on a device that
                  can hover — on a phone it would sit on every tile permanently. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-ink/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block"
              >
                <span className="caps text-eyebrow text-white">{caption}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * A full-bleed landscape break between two portrait grids.
 *
 * Reuses a cover frame, which is already cut to 16:9 at three widths and is
 * already in the reader's cache if they arrived from the homepage.
 */
function CoverBand({ slug }: { slug: string }) {
  const slide = HERO_SLIDES.find((candidate) => candidate.slug === slug);
  if (!slide) return null;

  return (
    <div aria-hidden className="mb-16 h-[45svh] w-full overflow-hidden md:mb-20 md:h-[60svh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.wide.src}
        srcSet={slide.wide.srcSet}
        sizes="100vw"
        alt=""
        width={slide.wide.width}
        height={slide.wide.height}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
