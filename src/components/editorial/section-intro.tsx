import { cn } from '@/lib/utils';

/**
 * The opening of every band on the page.
 *
 * One shape, used nine times: a tracked eyebrow, a two-line uppercase headline
 * on the left, and an optional column of body copy with a link on the right.
 * The asymmetry is the point — the headline owns the left half and the support
 * copy sits across the gutter from it, top-aligned to the headline's cap line
 * rather than centred against the block.
 *
 * `title` takes a node so callers control the line break: these headlines are
 * written as two lines and are not allowed to reflow into three.
 */
export function SectionIntro({
  eyebrow,
  title,
  titleId,
  body,
  action,
  level = 'h2',
  size = 'h2',
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  /** The band's `aria-labelledby` target. Required whenever the band names itself by it. */
  titleId?: string;
  body?: React.ReactNode;
  /** Sits under the body copy on the right, right-aligned on desktop. */
  action?: React.ReactNode;
  level?: 'h1' | 'h2';
  size?: 'display' | 'h1' | 'h2';
  className?: string;
}) {
  const Heading = level;

  return (
    <div className={cn('grid gap-8 lg:grid-cols-12 lg:gap-12', className)}>
      <div className="lg:col-span-7">
        <p className="caps text-eyebrow text-subtle-foreground">{eyebrow}</p>
        {/*
          The heading is the clip and the span inside it is what moves, which is
          why the overflow lives out here. A wipe needs an edge that does not
          move; putting `overflow-hidden` on the moving element instead clips
          nothing and the type simply slides over the copy above it.

          `pb-[0.12em]` is descender room. The display face is uppercase so most
          headlines have none, but "Your car." and "your floor." both carry a
          full stop that sat on the clip edge and lost its bottom row of pixels.
        */}
        <Heading
          id={titleId}
          className={cn(
            'mt-5 overflow-hidden pb-[0.12em] text-foreground',
            size === 'display' && 'text-display',
            size === 'h1' && 'text-h1',
            size === 'h2' && 'text-h2',
          )}
        >
          <span data-headline className="display-type block">
            {title}
          </span>
        </Heading>
      </div>

      {body || action ? (
        <div className="flex flex-col gap-6 lg:col-span-5 lg:items-end lg:pt-9">
          {body ? (
            <p className="max-w-sm text-body text-muted-foreground lg:text-right">{body}</p>
          ) : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
