import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the real listing box for box — filter row, grid, card internals — so
 * nothing moves when the data arrives.
 */
export function ListingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-8" aria-busy="true" aria-label="Loading products">
      {/* Same two 44px tracks the real bar renders, with overflow hidden so a
          narrow screen does not scroll a skeleton. */}
      <div className="flex flex-col gap-3 border-b border-border pb-5">
        <div className="flex gap-2 overflow-hidden py-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-hidden py-1">
          <Skeleton className="h-5 w-24 shrink-0" />
          <span aria-hidden className="min-w-4 flex-1" />
          <Skeleton className="h-11 w-28 shrink-0 rounded-full" />
          <Skeleton className="h-11 w-24 shrink-0 rounded-full" />
          <Skeleton className="h-11 w-32 shrink-0 rounded-full" />
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4 md:gap-6">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-2xl card-surface md:rounded-3xl">
            <Skeleton className="aspect-4/3 rounded-none lg:aspect-square" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
