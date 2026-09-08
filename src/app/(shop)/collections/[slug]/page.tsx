import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ListingSkeleton } from '@/features/catalog/components/listing-skeleton';
import {
  ListingUnavailable,
  ProductListing,
  type ListingSearchParams,
} from '@/features/catalog/components/product-listing';
import { getCategoryBySlug } from '@/features/catalog/server/queries';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { logger } from '@/lib/logger';

/**
 * Rendered per request, not cached.
 *
 * This page reads `searchParams` for the sort, stock filter and page number.
 * Combined with `revalidate` that is a contradiction — Next attempts a static
 * render and reading a dynamic input throws `DYNAMIC_SERVER_USAGE`. It only
 * looked fine while `generateStaticParams` happened to prerender every slug;
 * the moment that list came back empty, every collection returned a 500.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) return { title: 'Collection not found' };

  return {
    title: category.name,
    description: category.description ?? undefined,
    alternates: { canonical: `/collections/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ListingSearchParams>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  // A failed lookup is not the same as a missing collection. Letting it throw
  // took the route down, and answering 404 would tell crawlers this collection
  // no longer exists because the database happened to be unreachable.
  let category: Awaited<ReturnType<typeof getCategoryBySlug>>;
  try {
    category = await getCategoryBySlug(slug);
  } catch (error) {
    logger.error({ err: error, slug }, 'collection lookup unavailable');
    return (
      <div className="container-page py-12 md:py-16">
        <ListingUnavailable />
      </div>
    );
  }

  if (!category) notFound();

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          { label: category.name },
        ]}
      />

      <header className="mt-6 max-w-2xl">
        <h1 className="text-h1">{category.name}</h1>
        {category.description ? (
          <p className="text-muted-foreground mt-3 text-balance">{category.description}</p>
        ) : null}
      </header>

      <Suspense fallback={<ListingSkeleton />}>
        <ProductListing
          categorySlug={category.slug}
          basePath={`/collections/${category.slug}`}
          searchParams={query}
        />
      </Suspense>
    </div>
  );
}
