import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * The brand lockup.
 *
 * Two renderings of the same mark, because the supplied asset only works on one
 * kind of ground:
 *
 * - `brand` is `public/brand/logo.webp`, the real artwork. It sets "MOTOR" in
 *   white on transparent, so it needs something dark behind it — over the hero
 *   video it is exactly right, and on a light band the word simply vanishes and
 *   leaves a mark followed by "MATS".
 * - `ink` redraws the same lockup with "MOTOR" in `currentColor` and the mark
 *   and "MATS" in brand red, for the light surfaces the storefront is mostly
 *   made of. The wordmark is set in the site's display face.
 *
 * `auto` is the header: it carries both and lets CSS pick, keyed off the band's
 * own `data-over-hero`. Two small elements with only one ever painted is the
 * price of a single-tone raster — the day a dark-ink vector of the wordmark
 * exists, `ink` renders that instead and this collapses to one.
 */

const SIZES = {
  sm: { box: 'h-8', type: 'text-[1.0625rem]', gap: 'gap-1.5', w: 129, h: 32 },
  md: { box: 'h-10', type: 'text-[1.375rem]', gap: 'gap-2', w: 161, h: 40 },
  lg: { box: 'h-14', type: 'text-[1.875rem]', gap: 'gap-2.5', w: 226, h: 56 },
} as const;

type LogoSize = keyof typeof SIZES;
type LogoTone = 'ink' | 'brand' | 'auto';

export function MotormatsLogo({
  size = 'md',
  tone = 'ink',
  priority = false,
  className,
}: {
  size?: LogoSize;
  tone?: LogoTone;
  priority?: boolean;
  className?: string;
}) {
  const { box, w, h } = SIZES[size];

  if (tone === 'brand') {
    return <BrandRaster size={size} priority={priority} className={className} />;
  }

  if (tone === 'ink') {
    return <InkLockup size={size} className={className} />;
  }

  return (
    <span role="img" aria-label="Motormats" className={cn('inline-flex shrink-0', box, className)}>
      <Image
        src="/brand/logo.webp"
        alt=""
        width={w}
        height={h}
        priority={priority}
        // The loader passes /-prefixed sources through unchanged; unoptimized
        // avoids the width warning.
        unoptimized
        aria-hidden
        className="hidden h-full w-auto object-contain group-data-[over-hero=true]/header:block"
      />
      <InkLockup size={size} aria-hidden className="group-data-[over-hero=true]/header:hidden" />
    </span>
  );
}

function BrandRaster({
  size,
  priority,
  className,
}: {
  size: LogoSize;
  priority: boolean;
  className?: string;
}) {
  const { box, w, h } = SIZES[size];

  return (
    <Image
      src="/brand/logo.webp"
      alt="Motormats"
      width={w}
      height={h}
      priority={priority}
      unoptimized
      className={cn('w-auto object-contain', box, className)}
    />
  );
}

function InkLockup({
  size,
  className,
  'aria-hidden': ariaHidden,
}: {
  size: LogoSize;
  className?: string;
  'aria-hidden'?: boolean;
}) {
  const { box, type, gap } = SIZES[size];

  return (
    <span
      // One accessible name for the whole lockup: the mark is decorative and the
      // wordmark is split across two coloured spans, which a screen reader would
      // otherwise read as "MOTOR MATS" in two pieces.
      {...(ariaHidden ? { 'aria-hidden': true } : { role: 'img', 'aria-label': 'Motormats' })}
      className={cn('inline-flex shrink-0 items-center', box, gap, className)}
    >
      <svg
        aria-hidden
        // Cropped to the artwork rather than icon.svg's padded 148x160 square,
        // so the mark optically aligns with the cap height beside it.
        viewBox="28 23 92 114"
        fill="currentColor"
        className="h-[72%] w-auto text-accent"
      >
        <path d="M66 23V70L120 122V72L66 23Z" />
        <path d="M28 43V91L76 137V87L28 43Z" />
      </svg>

      <span className={cn('font-sans leading-none font-extrabold tracking-[-0.02em]', type)}>
        MOTOR<span className="text-accent">MATS</span>
      </span>
    </span>
  );
}
