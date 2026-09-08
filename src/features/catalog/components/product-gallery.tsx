'use client';

import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type GalleryImage = { assetId: string; alt: string };

/**
 * Product gallery.
 *
 * CSS scroll-snap rather than a carousel library: with a handful of images it
 * gives native momentum swiping on touch, keyboard scrolling, and no JavaScript
 * beyond tracking which thumbnail is active.
 */
export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-surface text-subtle-foreground grid aspect-square place-items-center rounded-3xl text-sm">
        No image available
      </div>
    );
  }

  const current = images[active] ?? images[0]!;

  return (
    <div className="space-y-3">
      <div className="bg-surface relative aspect-square overflow-hidden rounded-3xl">
        <Image
          src={current.assetId}
          alt={current.alt || productName}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 45vw"
          className="object-contain p-6"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, index) => (
            <li key={`${image.assetId}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-pressed={index === active}
                className={cn(
                  'bg-surface relative size-20 shrink-0 overflow-hidden rounded-xl border transition-colors duration-200',
                  index === active ? 'border-accent' : 'border-border hover:border-border-strong',
                )}
              >
                <Image
                  src={image.assetId}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
