import { MotormatsLogo } from '@/components/layout/motormats-logo';

/**
 * The brand mark on the admin's light surfaces.
 *
 * This used to wrap the logo in a dark plate: the raster asset set "MOTOR" in
 * white on transparent, so on a light ground that word vanished and only "MATS"
 * survived. `MotormatsLogo` now draws the wordmark instead of serving the
 * raster, so it takes its ink from `currentColor` and needs no plate on either
 * ground — which is what this component was always waiting for.
 *
 * Kept as a named component rather than inlined so the admin keeps one place to
 * size the mark, and so the sidebar and the sign-in screen cannot drift apart.
 */
export function AdminLogo({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return <MotormatsLogo size={size} />;
}
