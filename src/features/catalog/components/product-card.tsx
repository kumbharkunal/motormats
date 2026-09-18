import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { MatPlate } from '@/components/media/mat-plate';
import { matCutoutForAsset } from '@/features/catalog/mat-cutouts';
import { QuickAddButton } from '@/features/cart/components/quick-add-button';
import { formatPaise } from '@/lib/money';
import { cn } from '@/lib/utils';

/**
 * The shape a card needs, which both listings satisfy.
 *
 * The homepage's featured rows carry a category name; the collections rows
 * carry a compare-at price and a stock flag. Rather than force one query to
 * grow the other's columns, the card treats each as optional and renders what
 * it is given.
 */
export type ProductCardItem = {
  publicId: string;
  slug: string;
  name: string;
  fromPricePaise: number;
  imageAssetId: string | null;
  imageAlt: string | null;
  ratingAverage: number | null;
  ratingCount: number;
  /** Cheapest in-stock variant. Null renders quick-add as a disabled control. */
  defaultVariantPublicId: string | null;
  categoryName?: string | null;
  compareAtPricePaise?: number | null;
  inStock?: boolean;
};

const PLATE_SIZES =
  '(max-width: 639px) 78vw, (max-width: 1023px) 46vw, (max-width: 1439px) 30vw, 22vw';

/**
 * One product card for the whole storefront.
 *
 * The plate is a 4:5 frame with the mat sitting *inside* padding, not filling
 * it. The photography is a transparent cutout of a single mat, and the previous
 * `object-cover` on a 2:1 box guillotined it — the card showed a band of weave
 * with the bound edge and the badge cropped away. `object-contain` on a frame
 * built at the cutouts' own ratio shows the whole object, and the shadow is a
 * `drop-shadow`, which follows the alpha channel and so is cast by the mat's
 * silhouette rather than by its bounding box.
 *
 * Square corners, because `--radius-card` is 0: the layout is built from
 * hairline rules and butted plates, and the card was the last rounded object.
 *
 * Note the card is deliberately *not* one big `<Link>`: quick-add is a button,
 * and a button nested inside an anchor is invalid and unclickable on some
 * browsers. The plate and the title carry the navigation instead.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductCardItem;
  priority?: boolean;
  className?: string;
}) {
  const soldOut = product.inStock === false;
  const hasDiscount =
    product.compareAtPricePaise != null && product.compareAtPricePaise > product.fromPricePaise;
  const cutout = matCutoutForAsset(product.imageAssetId);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col border border-border bg-surface transition-colors duration-500 hover:border-accent/40',
        className,
      )}
    >
      <div className="relative aspect-4/5 overflow-hidden bg-paper">
        {cutout ? (
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 z-[1] block p-6 md:p-8"
            aria-label={`View ${product.name}`}
          >
            <MatPlate
              {...cutout}
              alt={product.imageAlt ?? cutout.alt}
              sizes={PLATE_SIZES}
              priority={priority}
              className="drop-shadow-[0_18px_28px_rgba(10,10,10,0.14)] transition-motion duration-700 ease-expo group-hover:-translate-y-2"
            />
          </Link>
        ) : product.imageAssetId ? (
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 z-[1] block"
            aria-label={`View ${product.name}`}
          >
            <Image
              src={product.imageAssetId}
              alt={product.imageAlt ?? `${product.name} car mat`}
              fill
              priority={priority}
              sizes={PLATE_SIZES}
              className="object-cover transition-motion duration-700 group-hover:scale-105"
            />
          </Link>
        ) : (
          <div className="grid h-full place-items-center text-xs text-subtle-foreground">
            No image
          </div>
        )}

        <Badge soldOut={soldOut} hasDiscount={hasDiscount} product={product} />
      </div>

      <div className="relative z-[2] flex flex-1 flex-col border-t border-border p-3 sm:p-4">
        <h3 className="font-display text-base leading-tight md:text-lg">
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors duration-200 hover:text-accent-text"
          >
            {product.name}
          </Link>
        </h3>

        <Rating average={product.ratingAverage} count={product.ratingCount} />

        {/*
          A two-column grid, not a wrapping flex row.

          The quick-add button is 44px and cannot get smaller — that is the touch
          target floor — so on a 320px screen in a two-up grid the price and the
          button together are wider than the card. Letting the row wrap solved the
          overflow and introduced a worse bug: a wrapped line holds one item, and
          `justify-between` puts a lone item at flex-start, so the button jumped
          to the *left* edge on exactly those cards with a compare-at price and
          stayed right on the rest. Across a grid it read as random.

          `minmax(0,1fr)` lets the price column shrink and wrap inside itself
          instead, so the button is pinned bottom-right on every card at every
          width, and nothing overflows.
        */}
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 pt-3">
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 font-semibold text-foreground tabular-nums">
            {formatPaise(product.fromPricePaise)}
            {hasDiscount ? (
              <span className="text-xs font-normal text-muted-foreground line-through">
                {formatPaise(product.compareAtPricePaise!)}
              </span>
            ) : null}
          </p>

          <span className="relative z-10">
            <QuickAddButton
              variantPublicId={product.defaultVariantPublicId}
              productName={product.name}
            />
          </span>
        </div>
      </div>
    </article>
  );
}

function Badge({
  soldOut,
  hasDiscount,
  product,
}: {
  soldOut: boolean;
  hasDiscount: boolean;
  product: ProductCardItem;
}) {
  const base =
    'absolute top-0 left-0 z-10 px-2.5 py-1.5 text-[0.625rem] font-semibold tracking-[0.12em] uppercase';

  if (soldOut) {
    return <span className={cn(base, 'bg-ink text-white')}>Sold out</span>;
  }

  if (hasDiscount) {
    const percent = Math.round(
      ((product.compareAtPricePaise! - product.fromPricePaise) / product.compareAtPricePaise!) *
        100,
    );
    return <span className={cn(base, 'bg-accent text-white')}>Save {percent}%</span>;
  }

  if (product.categoryName) {
    return (
      <span className={cn(base, 'bg-ink/85 text-white')}>{product.categoryName}</span>
    );
  }

  return null;
}

function Rating({ average, count }: { average: number | null; count: number }) {
  if (average === null || count === 0) return null;
  const filled = Math.floor(average);

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
      <span className="flex" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={12}
            className={index < filled ? 'fill-accent text-accent' : 'text-muted-foreground/30'}
          />
        ))}
      </span>
      {average.toFixed(1)} ({count})<span className="sr-only">out of 5, from {count} reviews</span>
    </p>
  );
}
