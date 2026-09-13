import type { Metadata } from 'next';
import { Suspense } from 'react';

import {
  ProductListing,
  type ListingSearchParams,
} from '@/features/catalog/components/product-listing';
import { ListingSkeleton } from '@/features/catalog/components/listing-skeleton';
import { VEHICLE_BRANDS } from '@/features/vehicles/data/brands';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'All Collections',
  description:
    'Every Motormats range — 7D Luxury, Carbon Series, Executive Carpet and All-Weather. Precision-cut for an exact fit.',
  alternates: { canonical: '/collections' },
};

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>;
}) {
  const params = await searchParams;

  // Resolve brand/model display names for the heading.
  const activeBrand = params.brand
    ? VEHICLE_BRANDS.find((b) => b.slug === params.brand)
    : undefined;
  const activeModel = activeBrand && params.model
    ? activeBrand.models.find((m) => m.slug === params.model)
    : undefined;

  const heading = activeBrand
    ? `Mats for ${activeBrand.name}${activeModel ? ` ${activeModel.name}` : ''}`
    : 'All Collections';

  const subtitle = activeBrand
    ? `Custom-fit car mats precision-cut for your ${activeBrand.name}${activeModel ? ` ${activeModel.name}` : ''}. Choose your range and finish.`
    : 'Four ranges, each laser-cut to your vehicle. Filter by fit, finish and availability.';

  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-2xl">
        <div className="flex items-center gap-3">
          {activeBrand ? (
            <Image
              src={activeBrand.image}
              alt={activeBrand.name}
              width={200}
              height={120}
              unoptimized
              className="h-14 w-24 object-contain md:h-16 md:w-28"
            />
          ) : null}
          <h1 className="text-h1">{heading}</h1>
        </div>
        <p className="mt-3 text-balance text-muted-foreground">
          {subtitle}
        </p>
      </header>

      <Suspense fallback={<ListingSkeleton />}>
        <ProductListing basePath="/collections" searchParams={params} />
      </Suspense>
    </div>
  );
}
