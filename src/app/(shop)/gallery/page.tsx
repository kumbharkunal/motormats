import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { HomeGalleryShowcase } from '@/features/home/components/home-gallery-showcase';
import { listFeaturedProducts } from '@/features/catalog/server/queries';
import { PageShell } from '@/features/marketing/components/page-shell';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Studio photography of the Motormats ranges — 7D Luxury, Carbon Series, Executive Carpet and All-Weather.',
  alternates: { canonical: '/gallery' },
};

export const revalidate = 3600;

export default async function GalleryPage() {
  const products = await listFeaturedProducts(12).catch(() => []);

  return (
    <PageShell
      breadcrumb="Gallery"
      title="Gallery"
      intro="Every range, shot in studio. Fitment is cut per vehicle, so the finish you see here is what arrives. The shape is matched to your model."
      wide
    >
      <HomeGalleryShowcase products={products} embedded />

      {products.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          Photography is being updated. Please check back shortly.
        </p>
      ) : (
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <li key={product.publicId}>
              <Link
                href={`/products/${product.slug}`}
                className="group block overflow-hidden rounded-2xl card-surface transition-colors duration-500 hover:border-accent/30 md:rounded-3xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-square">
                  {product.imageAssetId ? (
                    <Image
                      src={product.imageAssetId}
                      alt={product.imageAlt ?? `${product.name} car mat`}
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      priority={index < 3}
                      className="object-cover transition-motion duration-700 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex items-baseline justify-between gap-3 p-4">
                  <h2 className="text-sm font-semibold">{product.name}</h2>
                  {product.categoryName ? (
                    <p className="text-[0.6875rem] tracking-[0.1em] text-muted-foreground uppercase">
                      {product.categoryName}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12">
        <Button asChild size="lg">
          <Link href="/collections">Shop the ranges</Link>
        </Button>
      </div>
    </PageShell>
  );
}
