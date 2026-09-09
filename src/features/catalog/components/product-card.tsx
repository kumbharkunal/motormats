import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

/**
 * One product card for the whole storefront.
 *
 * The homepage and the collections grid had drifted into two cards that shared
 * a wrapper class and nothing else — different image fit, type scale, rating
 * treatment and price size, and only one of them could add to the cart.
 *
 * Note the card is deliberately *not* one big `<Link>`: quick-add is a button,
 * and a button nested inside an anchor is invalid and unclickable on some
 * browsers. The title carries the navigation instead.
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

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl card-surface transition-colors duration-500 hover:border-accent/30 md:rounded-3xl',
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-surface lg:aspect-square">
        {product.imageAssetId ? (
          <Image
            src={product.imageAssetId}
            alt={product.imageAlt ?? `${product.name} car mat`}
            fill
            priority={priority}
            sizes="(max-width: 639px) 70vw, (max-width: 1023px) 46vw, 22vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-subtle-foreground">
            No image
          </div>
        )}

        <Badge soldOut={soldOut} hasDiscount={hasDiscount} product={product} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold md:text-lg">
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors duration-200 hover:text-accent-text"
          >
            {/* Stretches the anchor over the card, so the whole surface
                navigates while quick-add stays a real button above it. */}
            <span className="absolute inset-0 z-0" aria-hidden />
            {product.name}
          </Link>
        </h3>

        <Rating average={product.ratingAverage} count={product.ratingCount} />

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="flex items-baseline gap-2 text-lg font-semibold text-foreground md:text-xl">
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
    'absolute top-3 left-3 z-10 rounded-full px-3 py-1 text-[0.625rem] font-semibold tracking-[0.1em] uppercase';

  if (soldOut) {
    return <span className={cn(base, 'bg-background/90 text-muted-foreground')}>Sold out</span>;
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
      <span className={cn(base, 'border border-border bg-surface-elevated/90 text-foreground')}>
        {product.categoryName}
      </span>
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
