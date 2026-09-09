import Box from '@mui/material/Box';

import { MotormatsLogo } from '@/components/layout/motormats-logo';

import { LOGO_PLATE, SHADOW } from './admin-tokens';

/** Plate padding per size, sized so the mark keeps its own breathing room. */
const PAD = {
  sm: { px: 1.25, py: 0.75 },
  md: { px: 1.5, py: 1 },
} as const;

/**
 * The brand mark on a light surface.
 *
 * `public/brand/logo.webp` sets "MOTOR" in white on transparent, so against this
 * panel's ground that word disappears and only "MATS" survives. A raster cannot
 * be recoloured selectively, so the asset keeps its own dark plate — the
 * storefront's own background colour, which is exactly what the mark was drawn
 * for, and which reads as a cue that the logo leads back to the store.
 *
 * The day a dark-ink variant of the asset exists, this becomes a plain
 * `MotormatsLogo` and the plate goes away.
 */
export function AdminLogo({ size = 'sm' }: { size?: keyof typeof PAD }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: LOGO_PLATE.ground,
        border: '1px solid',
        borderColor: LOGO_PLATE.border,
        boxShadow: SHADOW.card,
        borderRadius: 2.5,
        ...PAD[size],
      }}
    >
      <MotormatsLogo size={size} />
    </Box>
  );
}
