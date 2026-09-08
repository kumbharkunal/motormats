import { ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { DeckPanel } from '@/components/deck/deck-panel';
import { Button } from '@/components/ui/button';
import { listFeaturedProducts, type FeaturedProduct } from '@/features/catalog/server/queries';
import { QuickAddButton } from '@/features/home/components/quick-add-button';
import { logger } from '@/lib/logger';
import { formatPaise } from '@/lib/money';

export async function ProductsPanel() {
  let featured: FeaturedProduct[] = [];
  try {
    featured = await listFeaturedProducts(4);
  } catch (error) {
    logger.error({ err: error }, 'featured products unavailable on the homepage');
  }

  return (
    <DeckPanel labelledBy="products-heading">
      <div className="container-page relative pt-[clamp(6rem,11svh,7.5rem)] pb-[clamp(1.25rem,3svh,2.5rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="products-heading" className="text-h2 short:text-h3">
            Our Products
          </h2>
          <p className="text-muted-foreground mt-[clamp(0.5rem,1.5svh,1rem)] text-sm leading-relaxed text-balance md:text-base">
            Precision-engineered for every drive. Four ranges, each cut to your exact model.
          </p>
        </div>

        {featured.length > 0 ? (
          <ul
            className="mt-[clamp(1rem,3svh,2rem)] -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Featured products"
          >
            {featured.map((product) => (
              <li
                key={product.publicId}
                className="w-[70%] max-w-[19rem] shrink-0 snap-center sm:w-[46%] lg:w-auto lg:max-w-none"
              >
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-[clamp(1rem,3svh,2rem)] text-center text-sm">
            Our ranges are loading. Browse the full catalogue below.
          </p>
        )}

        <div className="mt-[clamp(1rem,2.5svh,1.5rem)] text-center">
          <Button asChild size="lg" className="group">
            <Link href="/collections">
              See all collections
              <ArrowRight
                aria-hidden
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Button>
        </div>
      </div>
    </DeckPanel>
  );
}

function ProductCard({ product }: { product: FeaturedProduct }) {
  return (
    <article className="card-surface hover:border-accent/30 group flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-500 md:rounded-3xl">
      <div className="bg-surface relative aspect-[4/3] max-h-[30svh] overflow-hidden lg:aspect-square">
        {product.imageAssetId ? (
          <Image
            src={product.imageAssetId}
            alt={product.imageAlt ?? `${product.name} car mat`}
            fill
            sizes="(max-width: 639px) 70vw, (max-width: 1023px) 46vw, 22vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}

        {product.categoryName ? (
          <span className="border-border bg-surface-elevated/90 text-foreground absolute top-3 left-3 rounded-full border px-3 py-1 text-[0.625rem] font-semibold tracking-[0.1em] uppercase">
            {product.categoryName}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold md:text-lg">
          <Link href={`/products/${product.slug}`} className="hover:text-accent-text transition-colors duration-200">
            {product.name}
          </Link>
        </h3>

        <Rating average={product.ratingAverage} count={product.ratingCount} />

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="text-foreground text-lg font-semibold md:text-xl">
            {formatPaise(product.fromPricePaise)}
          </p>
          <QuickAddButton
            variantPublicId={product.defaultVariantPublicId}
            productName={product.name}
          />
        </div>
      </div>
    </article>
  );
}

function Rating({ average, count }: { average: number | null; count: number }) {
  if (average === null || count === 0) return null;

  const filled = Math.floor(average);

  return (
    <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-[0.6875rem]">
      <span className="flex" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={12}
            className={index < filled ? 'fill-accent text-accent' : 'text-muted-foreground/30'}
          />
        ))}
      </span>
      {average.toFixed(1)} ({count})
      <span className="sr-only">out of 5, from {count} reviews</span>
    </p>
  );
}
