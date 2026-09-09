'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { MotormatsLogo } from '@/components/layout/motormats-logo';

import { BRAND, BRAND_PANEL } from './admin-tokens';
import { AdminLogo } from './admin-logo';

/**
 * Shared chrome for the unauthenticated admin pages (sign in, reset password).
 *
 * They must look like one flow, so the shell lives here rather than being
 * copied per page — the grid, the brand panel and the 400px column are defined
 * once and every page inherits the responsive behaviour with them.
 */
export function AdminAuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  /** Bottom link, e.g. back to the store or back to sign in. */
  footer: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'grid',
        // The brand panel is decoration; below md the form gets the whole screen.
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
        bgcolor: 'background.default',
      }}
    >
      <BrandPanel />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // White rather than the canvas tint, so the form column separates
          // cleanly from the dark panel beside it.
          bgcolor: 'background.paper',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 5, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Below md the brand panel is gone, so the mark lands on this light
              column and has to be the dark-ink one. */}
          <Box sx={{ display: { md: 'none' }, mb: 4 }}>
            <Link href="/" aria-label="Motormats — go to the storefront">
              <AdminLogo size="sm" />
            </Link>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Box
              aria-hidden
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: BRAND.wash,
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={17} />
            </Box>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', fontSize: 11, lineHeight: 1 }}
            >
              Admin panel
            </Typography>
          </Stack>

          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 26, sm: 30 } }}>
            {title}
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1, mb: 3.5 }}>
            {subtitle}
          </Typography>

          {children}

          <Box sx={{ mt: 4, ...QUIET_LINK }}>
            <Link href={footer.href}>
              <ArrowLeft size={15} aria-hidden />
              {footer.label}
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/** Low-emphasis inline link, sized to clear the 44px touch-target minimum. */
export const QUIET_LINK = {
  '& a': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    fontSize: 13,
    fontWeight: 600,
    color: 'text.secondary',
    textDecoration: 'none',
  },
  '& a:hover': { color: 'text.primary' },
} as const;

/**
 * Decorative only — hidden below md so the form owns the small-screen viewport.
 *
 * Deliberately still dark while the rest of the panel is light: the contrast is
 * what makes a sign-in screen feel finished, and it is the one admin surface
 * where the white-wordmark logo asset still belongs. Being a dark island inside
 * a light theme, it cannot use the theme's ink or divider — those are tuned for
 * white and would vanish here — so it carries its own from `BRAND_PANEL`.
 */
function BrandPanel() {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 6,
        borderRight: '1px solid',
        borderColor: BRAND_PANEL.border,
        backgroundImage:
          'radial-gradient(120% 90% at 8% 0%, rgba(225,6,0,0.16) 0%, rgba(225,6,0,0) 55%),' +
          'linear-gradient(160deg, #141416 0%, #0A0A0B 60%)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.35,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(80% 60% at 20% 20%, #000 0%, transparent 75%)',
        }}
      />

      <Box sx={{ position: 'relative' }}>
        <Link
          href="/"
          aria-label="Motormats — go to the storefront"
          style={{ display: 'inline-flex' }}
        >
          <MotormatsLogo size="md" priority />
        </Link>
      </Box>

      <Box sx={{ position: 'relative', maxWidth: 380 }}>
        <Typography
          variant="h3"
          component="p"
          sx={{
            color: BRAND_PANEL.ink,
            fontSize: 34,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          Run the store.
        </Typography>
        <Typography sx={{ color: BRAND_PANEL.inkMuted, mt: 2, fontSize: 14.5, lineHeight: 1.6 }}>
          Orders, inventory and customers — everything behind the storefront, in one place.
        </Typography>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: BRAND_PANEL.inkMuted, position: 'relative', fontSize: 12 }}
      >
        Authorised access only. Activity on this panel is logged.
      </Typography>
    </Box>
  );
}
