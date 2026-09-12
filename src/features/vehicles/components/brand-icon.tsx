/**
 * Car silhouette icons — minimal line-art outlines rendered as inline SVG.
 *
 * Five body styles match the `bodyStyle` field on brand data. Each path is a
 * single stroke-only outline at a consistent 120×48 viewBox, so the car reads
 * as a clean profile at the small sizes the rail needs.
 *
 * `currentColor` for the stroke, so the icon follows the text colour of its
 * parent (muted by default, foreground on hover/active).
 */

import { cn } from '@/lib/utils';

type BrandIconProps = {
  bodyStyle: 'hatchback' | 'sedan' | 'suv' | 'luxury-sedan' | 'compact-suv';
  className?: string;
};

const SILHOUETTES: Record<BrandIconProps['bodyStyle'], string> = {
  hatchback:
    // Compact 2-box profile: short bonnet, tall cabin, sloped rear
    'M10 38 L10 30 Q10 26 14 24 L28 20 Q32 18 36 16 L52 12 Q58 10 64 10 L74 10 Q80 10 82 14 L84 18 Q86 22 90 24 L100 28 Q104 30 106 32 L108 34 Q110 36 110 38 Z M22 38 Q22 32 28 32 Q34 32 34 38 M80 38 Q80 32 86 32 Q92 32 92 38 M40 18 L40 26 M64 10 L64 26',
  sedan:
    // Classic 3-box: long bonnet, lower roofline, boot
    'M8 38 L8 32 Q8 28 12 26 L24 22 Q28 18 34 16 L50 12 Q56 10 62 10 L72 10 Q78 10 82 12 L94 16 Q98 18 100 22 L106 26 Q110 28 112 32 L112 38 Z M22 38 Q22 32 28 32 Q34 32 34 38 M84 38 Q84 32 90 32 Q96 32 96 38 M44 14 L44 24 M78 12 L78 24',
  suv:
    // Tall box: high ground clearance, flat roof, squared haunches
    'M8 40 L8 30 Q8 26 12 24 L22 20 Q26 16 30 14 L46 10 Q50 8 56 8 L76 8 Q82 8 86 10 L98 14 Q102 16 104 20 L108 24 Q112 26 112 30 L112 40 Z M22 40 Q22 34 28 34 Q34 34 34 40 M84 40 Q84 34 90 34 Q96 34 96 40 M40 12 L40 24 M82 10 L82 24',
  'luxury-sedan':
    // Elongated 3-box: stretched wheelbase, sweeping roofline
    'M6 38 L6 32 Q6 28 10 26 L20 22 Q24 18 30 14 L48 10 Q54 8 60 8 L76 8 Q82 8 86 10 L98 14 Q102 18 104 22 L110 26 Q114 28 114 32 L114 38 Z M20 38 Q20 32 26 32 Q32 32 32 38 M86 38 Q86 32 92 32 Q98 32 98 38 M42 12 L42 24 M82 10 L82 24',
  'compact-suv':
    // Crossover: moderate height, sloped rear, rounded profile
    'M8 38 L8 30 Q8 26 12 24 L24 18 Q28 14 34 12 L50 10 Q56 8 62 8 L74 8 Q80 8 84 10 L96 14 Q100 18 102 22 L108 26 Q112 28 112 32 L112 38 Z M22 38 Q22 32 28 32 Q34 32 34 38 M84 38 Q84 32 90 32 Q96 32 96 38 M42 12 L42 24 M80 10 L80 24',
};

export function BrandIcon({ bodyStyle, className }: BrandIconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-8 w-14 shrink-0', className)}
    >
      <path d={SILHOUETTES[bodyStyle]} />
    </svg>
  );
}
