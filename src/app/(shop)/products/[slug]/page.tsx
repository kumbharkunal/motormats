import { Star } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ProductGallery } from '@/features/catalog/components/product-gallery';
import { VariantSelector } from '@/features/catalog/components/variant-selector';
import { getProductBySlug, listActiveProductSlugs } from '@/features/catalog/server/queries';
import { BUSINESS } from '@/features/marketing/business';
import { clientEnv } from '@/lib/env.client';
import { cloudinaryImageUrl } from '@/lib/image-loader';
import { formatPaise } from '@/lib/money';

/**
 * Pre-rendering is an optimisation, not a build requirement. A host that cannot
 * reach the database during the build still deploys; those pages render on the
 * first request and are then cached by ISR.
 */
export async function generateStaticParams() {
  try {
    const products = await listActiveProductSlugs();
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

/** Catalogue changes are published by revalidation, not by a redeploy. */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  const ogImage = product.images[0] ? cloudinaryImageUrl(product.images[0].assetId) : null;

  return {
    title: product.name,
    description: product.summary ?? product.description?.slice(0, 160) ?? undefined,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.summary ?? undefined,
      type: 'website',
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 1200, alt: product.name }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const inStock = product.variants.some((variant) => variant.stockQuantity > 0);
  const lowestPrice = Math.min(
    ...product.variants.map((v) => v.pricePaise),
    product.basePricePaise,
  );
  const highestPrice = Math.max(
    ...product.variants.map((v) => v.pricePaise),
    product.basePricePaise,
  );

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary ?? product.description ?? undefined,
    sku: product.variants[0]?.sku,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    image: product.images
      .map((image) => cloudinaryImageUrl(image.assetId))
      .filter((url): url is string => url !== null),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: (lowestPrice / 100).toFixed(2),
      highPrice: (highestPrice / 100).toFixed(2),
      offerCount: product.variants.length,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${clientEnv.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
    },
    // AggregateRating is emitted only when real ratings exist — never invented.
    ...(product.ratingAverage !== null && product.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratingAverage.toFixed(1),
            reviewCount: product.ratingCount,
          },
        }
      : {}),
  };

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          ...(product.category
            ? [{ label: product.category.name, href: `/collections/${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      {/*
        Two measured columns, centred — not an edge-to-edge split.

        The mat cutouts are composed on a 4:5 frame, so a gallery given the full
        half of a 1440px page is over a thousand pixels tall and runs off the
        screen before the price beside it has been read. Capping both columns and
        centring the pair keeps the frame at a readable size and gives the page
        an editorial measure instead of two columns stretched to the gutters.

        The buy column sticks.

        The gallery is the taller element and the column beside it is short, so
        on a desktop the reader scrolled the price and the add-to-cart button off
        the screen while still looking at the product. `items-start` plus
        `sticky` keeps the decision in view for as long as the pictures last —
        which is the one thing a product page is for.
      */}
      <div className="mt-8 grid items-start justify-center gap-10 lg:grid-cols-[minmax(0,34rem)_minmax(0,30rem)] lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
          <p className="caps text-eyebrow text-subtle-foreground">
            {product.category?.name ?? product.brand ?? 'Motormats'}
          </p>

          <h1 className="display-type mt-4 text-h1 text-foreground">{product.name}</h1>

          {product.summary ? (
            <p className="mt-5 text-balance text-body text-muted-foreground">{product.summary}</p>
          ) : null}

          {product.ratingAverage !== null && product.ratingCount > 0 ? (
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex" aria-hidden>
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    size={13}
                    className={
                      index < Math.floor(product.ratingAverage ?? 0)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground/30'
                    }
                  />
                ))}
              </span>
              <span className="tabular-nums">{product.ratingAverage.toFixed(1)}</span>
              <span className="text-subtle-foreground">({product.ratingCount})</span>
            </p>
          ) : null}

          <div className="mt-9 border-t border-border pt-9">
            <VariantSelector product={product} />
          </div>

          {/* The three things a reader asks before committing, as hairline rows
              rather than a two-column block that left "Dispatch" stranded. */}
          <dl className="mt-9 border-t border-border text-sm">
            <SpecRow term="Price range">
              {lowestPrice === highestPrice
                ? formatPaise(lowestPrice)
                : `${formatPaise(lowestPrice)} – ${formatPaise(highestPrice)}`}
            </SpecRow>
            <SpecRow term="Dispatch">{BUSINESS.dispatchDays}</SpecRow>
            <SpecRow term="Returns">{BUSINESS.returnWindowDays} days, unused</SpecRow>
          </dl>
        </div>
      </div>

      {product.description ? (
        <section
          aria-labelledby="details-heading"
          className="mt-16 border-t border-border pt-10 md:mt-24"
        >
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
            <h2 id="details-heading" className="display-type text-h3 text-foreground lg:col-span-4">
              Details
            </h2>
            <p className="max-w-prose text-body leading-relaxed text-muted-foreground lg:col-span-8">
              {product.description}
            </p>
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </div>
  );
}

/** One hairline row of the spec list. */
function SpecRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border py-3.5">
      <dt className="caps text-eyebrow text-subtle-foreground">{term}</dt>
      <dd className="text-right font-medium text-foreground tabular-nums">{children}</dd>
    </div>
  );
}
