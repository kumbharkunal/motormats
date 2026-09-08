import Image from 'next/image';
import Link from 'next/link';

import type { ProductListItem } from '@/features/catalog/server/queries';
import { formatPaise } from '@/lib/money';
import { cn } from '@/lib/utils';

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductListItem;
  /** Set on the first row only; everything below the fold stays lazy. */
  priority?: boolean;
  className?: string;
}) {
  const hasDiscount =
    product.compareAtPricePaise !== null && product.compareAtPricePaise > product.fromPricePaise;

  return (
    <article className={cn('h-full', className)}>
      <Link
        href={`/products/${product.slug}`}
        className="card-surface hover:border-accent/30 group flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-500 md:rounded-3xl"
      >
        <div className="bg-surface relative aspect-square overflow-hidden">
          {product.imageAssetId ? (
            <Image
              src={product.imageAssetId}
              alt={product.imageAlt ?? product.name}
              fill
              priority={priority}
              sizes="(max-width: 639px) 80vw, (max-width: 1023px) 45vw, 23vw"
              className="object-contain p-3 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="text-subtle-foreground grid h-full place-items-center text-xs">
              No image
            </div>
          )}

          {!product.inStock ? (
            <span className="bg-background/90 text-muted-foreground absolute top-3 left-3 rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-wide uppercase">
              Sold out
            </span>
          ) : hasDiscount ? (
            <span className="bg-accent absolute top-3 left-3 rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-wide text-white uppercase">
              Save {discountPercent(product.fromPricePaise, product.compareAtPricePaise!)}%
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-sans text-sm font-semibold">{product.name}</h3>
          {product.summary ? (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{product.summary}</p>
          ) : null}

          {product.ratingAverage !== null ? (
            <p className="text-muted-foreground mt-2 text-xs">
              <span className="text-accent-text" aria-hidden>
                ★
              </span>{' '}
              {product.ratingAverage.toFixed(1)}
              <span className="sr-only"> out of 5</span> ({product.ratingCount})
            </p>
          ) : null}

          <p className="mt-auto flex items-baseline gap-2 pt-3 text-sm font-semibold">
            {formatPaise(product.fromPricePaise)}
            {hasDiscount ? (
              <span className="text-muted-foreground text-xs font-normal line-through">
                {formatPaise(product.compareAtPricePaise!)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
}

function discountPercent(price: number, compareAt: number): number {
  return Math.round(((compareAt - price) / compareAt) * 100);
}
