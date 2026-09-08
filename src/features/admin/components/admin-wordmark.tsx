import Box from '@mui/material/Box';

import { BRAND, INK } from './admin-tokens';

/**
 * The Motormats mark for light surfaces.
 *
 * `public/brand/logo.webp` sets "MOTOR" in white, so it disappears on this
 * panel's ground — but it is still the right asset on the dark sign-in brand
 * panel, which is why that keeps using `MotormatsLogo` and this exists
 * alongside it rather than replacing it.
 *
 * The glyph is traced from the raster: two parallelograms sharing a ~43° slant
 * and a 48-unit vertical edge, the right one about 12% longer. Sizes below map
 * to the ink the raster actually shows inside its own `h-8` / `h-10` box, so
 * the two marks read at the same optical size wherever they sit side by side.
 */
const SIZES = {
  sm: { glyph: 23, fontSize: 13, gap: 5.4 },
  md: { glyph: 29, fontSize: 16.3, gap: 6.8 },
} as const;

type WordmarkSize = keyof typeof SIZES;

export function AdminWordmark({ size = 'md' }: { size?: WordmarkSize }) {
  const { glyph, fontSize, gap } = SIZES[size];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap}px`,
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 93 114"
        aria-hidden
        sx={{ height: glyph, width: 'auto', display: 'block', flexShrink: 0 }}
      >
        <path d="M1 21 L48 65 L48 113 L1 69 Z" fill={BRAND.main} />
        <path d="M39 0 L92 50 L92 98 L39 48 Z" fill={BRAND.main} />
      </Box>

      {/* Inter rather than the display face: the raster's wordmark is a wide
          grotesque, and Roboto Condensed would read visibly narrower. 0.06em
          tracking matches its letter spacing at the measured cap height. */}
      <Box
        component="span"
        sx={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontWeight: 800,
          fontSize,
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
        }}
      >
        <Box component="span" sx={{ color: INK.primary }}>
          MOTOR
        </Box>
        <Box component="span" sx={{ color: BRAND.main }}>
          MATS
        </Box>
      </Box>
    </Box>
  );
}
