import { cn } from '@/lib/utils';

/**
 * A photograph in a grid tile, served at the width that tile actually uses.
 *
 * The sibling of `MatPlate`, and a plain `<img>` for the same reason:
 * `images.loader` is custom, which switches Next's optimizer off, and the loader
 * only resizes when an ImageKit endpoint is configured — which it is not. Every
 * `next/image` on a local file therefore ships the full-size original. Native
 * `srcSet` needs no resizer, so it is the only thing here that serves a smaller
 * file.
 *
 * Where it differs from `MatPlate` is the fit. A mat cutout is composed on its
 * own frame and must never be cropped, so that one is `object-contain`. These
 * are photographs filling a tile built at their own 2:3, so `object-cover` has
 * almost nothing to trim and guarantees the tile is filled edge to edge.
 *
 * Props are the shape `PHOTO_GRID` entries already have, so call sites spread a
 * manifest entry rather than restating it.
 */
export function PhotoPlate({
  src,
  srcSet,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  srcSet: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
