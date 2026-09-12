import { cn } from '@/lib/utils';

/**
 * Placeholder block. Skeletons must mirror the real content's box so nothing
 * shifts when data arrives — always give one an explicit size.
 *
 * The shimmer is a single `background-position` animation on a gradient, which
 * stays on the compositor; animating width or opacity per element would not.
 * It sweeps with ink rather than white — a white sweep over a light placeholder
 * has nothing to travel against.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative overflow-hidden rounded-md bg-surface-elevated',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-foreground/6 before:to-transparent',
        'before:animate-[skeleton-sweep_1.6s_ease-in-out_infinite]',
        'motion-reduce:before:animate-none',
        className,
      )}
      {...props}
    />
  );
}

/** Convenience wrapper for multi-line text placeholders. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          // The last line is short, the way real wrapped text ends.
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
