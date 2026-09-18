import Image from 'next/image';

import { canResizeLocalImages } from '@/lib/image-loader';
import { cn } from '@/lib/utils';

/**
 * Every source format on the site, and nothing else:
 *
 * - `2/3` — the HD shoot. Shot landscape and tagged EXIF orientation 8, so the
 *   true orientation is portrait. See `scripts/optimize-hd-photos.mjs`.
 * - `4/5` and `9/16` — the deck export, still used for the reels posters.
 * - `4/3` — the naming deck's surface photographs. See
 *   `scripts/optimize-surface-photos.mjs`.
 *
 * A frame is always built at the file's own ratio, so `object-cover` has
 * nothing to cut and the whole photograph is visible.
 */
export type FrameRatio = '2/3' | '4/5' | '9/16' | '4/3';

const RATIO_CLASS: Record<FrameRatio, string> = {
  '2/3': 'aspect-[2/3]',
  '4/5': 'aspect-[4/5]',
  '9/16': 'aspect-[9/16]',
  '4/3': 'aspect-[4/3]',
};

/** For frames that supply their own `<Image>`, such as a crossfading carousel. */
export function frameRatioClass(ratio: FrameRatio): string {
  return RATIO_CLASS[ratio];
}

export function EditorialFrame({
  src,
  alt,
  ratio,
  sizes,
  priority = false,
  quality = 88,
  className,
  imageClassName,
  children,
}: {
  src: string;
  alt: string;
  ratio: FrameRatio;
  /** Required: a wrong `sizes` is what makes a magazine page ship 4K files. */
  sizes: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  imageClassName?: string;
  /** Overlay content (captions, index numerals) rendered above the photo. */
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-elevated',
        RATIO_CLASS[ratio],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        // Without ImageKit in front of `public/` there is no resizer, so the
        // loader can only return the one master file it has. Next detects that,
        // warns, and builds a srcset of identical URLs; this is the honest
        // description of the same thing, minus the dead srcset.
        unoptimized={!canResizeLocalImages}
        className={cn('object-cover', imageClassName)}
      />
      {children}
    </div>
  );
}

/** Caption set below a frame, in the magazine's own voice. */
export function FrameCaption({
  index,
  children,
  className,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('mt-3 flex gap-3 text-[0.8125rem] leading-snug text-muted-foreground', className)}>
      {index ? (
        <span className="shrink-0 font-semibold tabular-nums text-accent">{index}</span>
      ) : null}
      <span>{children}</span>
    </p>
  );
}
