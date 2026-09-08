import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ProductListing, type ListingSearchParams } from '@/features/catalog/components/product-listing';
import { ListingSkeleton } from '@/features/catalog/components/listing-skeleton';

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

  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-2xl">
        <h1 className="text-h1">All Collections</h1>
        <p className="text-muted-foreground mt-3 text-balance">
          Four ranges, each laser-cut to your vehicle. Filter by fit, finish and availability.
        </p>
      </header>

      <Suspense fallback={<ListingSkeleton />}>
        <ProductListing basePath="/collections" searchParams={params} />
      </Suspense>
    </div>
  );
}
