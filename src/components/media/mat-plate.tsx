import { cn } from '@/lib/utils';

/**
 * A mat cutout, served at the width the viewport actually needs.
 *
 * Deliberately a plain `<img>` rather than `next/image`. `next.config.ts` sets
 * `images.loader: 'custom'`, which switches Next's own optimizer off, and the
 * custom loader only resizes `/`-prefixed sources when an ImageKit endpoint is
 * configured — which it is not. Every `next/image` on a local file therefore
 * passes `unoptimized` and ships the full-size original. Native `srcSet` needs
 * no resizer at all, so it is the only path here that serves a smaller file.
 *
 * Props are the shape `MAT_CUTOUTS` entries already have, so call sites spread
 * a manifest entry rather than restating it. Nothing is imported from the
 * catalogue feature: shared UI does not reach into a feature module.
 */
export function MatPlate({
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
    // next/image cannot resize these (see the note above) and would ship the
    // 960w file to a phone, which is the opposite of what the rule is guarding.
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
      // `object-contain`: the cutouts are trimmed to the mat and composed on one
      // 4:5 frame, so they must never be cropped to fill a box.
      className={cn('h-full w-full object-contain', className)}
    />
  );
}
