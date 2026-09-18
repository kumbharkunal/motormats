'use client';

import Image from 'next/image';
import { useState } from 'react';

import { MatPlate } from '@/components/media/mat-plate';
import { matCutoutForAsset } from '@/features/catalog/mat-cutouts';
import { cn } from '@/lib/utils';

type GalleryImage = { assetId: string; alt: string };

const PLATE_SIZES = '(max-width: 1023px) 92vw, 46vw';

/**
 * Product gallery.
 *
 * The frame is built at 4:5 — the ratio the mat cutouts are composed on — so
 * `object-contain` has nothing to letterbox and the mat lands at the same size
 * here as it does on the card that got you here. Square, on paper, with the
 * shadow cast by the mat's own silhouette rather than by a box: `drop-shadow`
 * follows the alpha channel, and these are transparent cutouts.
 *
 * CSS scroll-snap was never needed here — there are a handful of images and a
 * thumbnail strip, so the only state is which one is showing.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="grid aspect-4/5 place-items-center border border-border bg-surface text-sm text-subtle-foreground">
        No image available
      </div>
    );
  }

  const current = images[active] ?? images[0]!;
  const cutout = matCutoutForAsset(current.assetId);

  return (
    // The column is capped to this width too, so the frame never grows past the
    // point where a 4:5 plate is taller than the screen.
    <div className="mx-auto w-full max-w-[34rem]">
      <div className="relative aspect-4/5 overflow-hidden border border-border bg-surface p-8 md:p-12">
        {cutout ? (
          <MatPlate
            {...cutout}
            alt={current.alt || productName}
            sizes={PLATE_SIZES}
            priority
            className="drop-shadow-[0_28px_44px_rgba(10,10,10,0.16)]"
          />
        ) : (
          <Image
            src={current.assetId}
            alt={current.alt || productName}
            fill
            priority
            sizes={PLATE_SIZES}
            className="object-contain p-8"
          />
        )}
      </div>

      {images.length > 1 ? (
        <ul className="mt-px flex gap-px bg-border">
          {images.map((image, index) => {
            const thumb = matCutoutForAsset(image.assetId);
            const selected = index === active;

            return (
              <li key={`${image.assetId}-${index}`} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1} of ${images.length}`}
                  aria-pressed={selected}
                  className={cn(
                    'relative block aspect-square w-full bg-surface p-3 transition-colors duration-200',
                    // The selection is a rule along the top edge, not a border
                    // around the tile — a border on one tile in a hairline grid
                    // shifts every tile beside it by a pixel.
                    'after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:origin-left after:transition-motion after:duration-300',
                    selected
                      ? 'after:scale-x-100 after:bg-accent'
                      : 'after:scale-x-0 hover:bg-paper after:bg-accent',
                  )}
                >
                  {thumb ? (
                    <MatPlate {...thumb} alt="" sizes="120px" />
                  ) : (
                    <Image src={image.assetId} alt="" fill sizes="120px" className="object-contain p-2" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
