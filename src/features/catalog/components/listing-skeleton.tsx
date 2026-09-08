import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the real listing box for box — filter row, grid, card internals — so
 * nothing moves when the data arrives.
 */
export function ListingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-8" aria-busy="true" aria-label="Loading products">
      <div className="border-border flex flex-col gap-5 border-b pb-6">
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-24 rounded-full" />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-11 w-64 rounded-full" />
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4 md:gap-6">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="card-surface overflow-hidden rounded-2xl md:rounded-3xl">
            <Skeleton className="aspect-square rounded-none" />
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
