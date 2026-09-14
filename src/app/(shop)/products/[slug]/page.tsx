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

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.brand ? (
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {product.brand}
            </p>
          ) : null}

          <h1 className="mt-2 text-h1">{product.name}</h1>

          {product.summary ? (
            <p className="mt-3 text-balance text-muted-foreground">{product.summary}</p>
          ) : null}

          {product.ratingAverage !== null ? (
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="text-accent-text" aria-hidden>
                ★
              </span>{' '}
              {product.ratingAverage.toFixed(1)} out of 5 ({product.ratingCount} reviews)
            </p>
          ) : null}

          <div className="mt-8">
            <VariantSelector product={product} />
          </div>

          {product.description ? (
            <div className="mt-10 border-t border-border pt-8">
              <h2 className="text-h3">Details</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          ) : null}

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-8 text-sm">
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">Price range</dt>
              <dd className="mt-1 font-semibold">
                {lowestPrice === highestPrice
                  ? formatPaise(lowestPrice)
                  : `${formatPaise(lowestPrice)} – ${formatPaise(highestPrice)}`}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">Dispatch</dt>
              <dd className="mt-1 font-semibold">{BUSINESS.dispatchDays}</dd>
            </div>
          </dl>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </div>
  );
}
