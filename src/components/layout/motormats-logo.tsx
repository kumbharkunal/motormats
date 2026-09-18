import Image from 'next/image';

import { BAR_A, BAR_B } from '@/components/feedback/brand-mark-paths';
import { cn } from '@/lib/utils';

/**
 * The brand lockup — the supplied artwork, and only the supplied artwork.
 *
 * `public/brand/logo.webp` sets "MOTOR" in white on transparent, so it needs a
 * dark ground under it or the word simply vanishes and leaves a mark followed by
 * "MATS". Every place the storefront shows the full lockup is dark — the header
 * band, the drawer, the footer — so it is used exactly as supplied, with nothing
 * behind it.
 *
 * `mark` is for the two utility screens that are not dark: sign-in and the admin
 * shell. It is the mark alone, the same geometry as `icon.svg`, in brand red —
 * which reads on any ground and involves no white type at all. A wordmark is not
 * what those screens need.
 *
 * There is deliberately no third rendering. An earlier pass set the raster on a
 * black plate so it could sit on light surfaces; it looked like a sticker.
 */

const SIZES = {
  sm: { box: 'h-8', w: 129, h: 32 },
  md: { box: 'h-9', w: 161, h: 40 },
  lg: { box: 'h-12', w: 226, h: 56 },
} as const;

type LogoSize = keyof typeof SIZES;
type LogoTone = 'bare' | 'mark';

export function MotormatsLogo({
  size = 'md',
  tone = 'bare',
  priority = false,
  className,
}: {
  size?: LogoSize;
  tone?: LogoTone;
  priority?: boolean;
  className?: string;
}) {
  const { box, w, h } = SIZES[size];

  if (tone === 'mark') {
    return (
      <span
        role="img"
        aria-label="Motormats"
        className={cn('inline-flex shrink-0 items-center', box, className)}
      >
        <svg
          aria-hidden
          // Cropped to the artwork rather than icon.svg's padded square, so the
          // mark sits on the same optical line as whatever is beside it.
          viewBox="28 23 92 114"
          fill="currentColor"
          className="h-full w-auto text-accent"
        >
          <path d={BAR_A} />
          <path d={BAR_B} />
        </svg>
      </span>
    );
  }

  return (
    <Image
      src="/brand/logo.webp"
      alt="Motormats"
      width={w}
      height={h}
      priority={priority}
      // The loader passes /-prefixed sources through unchanged, and the file is
      // 11KB — there is nothing here for a resizer to save.
      unoptimized
      className={cn('w-auto object-contain', box, className)}
    />
  );
}
