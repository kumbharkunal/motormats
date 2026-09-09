import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { DeckPanel } from '@/components/deck/deck-panel';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/features/catalog/components/product-card';
import { listFeaturedProducts, type FeaturedProduct } from '@/features/catalog/server/queries';
import { logger } from '@/lib/logger';

export async function ProductsPanel() {
  let featured: FeaturedProduct[] = [];
  try {
    featured = await listFeaturedProducts(4);
  } catch (error) {
    logger.error({ err: error }, 'featured products unavailable on the homepage');
  }

  return (
    <DeckPanel labelledBy="products-heading">
      <div className="relative container-page pt-[clamp(6rem,11svh,7.5rem)] pb-[clamp(1.25rem,3svh,2.5rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="products-heading" className="text-h2 short:text-h3">
            Our Products
          </h2>
          <p className="mt-[clamp(0.5rem,1.5svh,1rem)] text-sm leading-relaxed text-balance text-muted-foreground md:text-base">
            Precision-engineered for every drive. Four ranges, each cut to your exact model.
          </p>
        </div>

        {featured.length > 0 ? (
          <ul
            className="-mx-5 mt-[clamp(1rem,3svh,2rem)] flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-5 pb-4 [-ms-overflow-style:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
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
          <p className="mt-[clamp(1rem,3svh,2rem)] text-center text-sm text-muted-foreground">
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
