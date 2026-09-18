'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { BRAND, INK, LINE, SHADOW, STATUS, SURFACE } from './admin-tokens';

/**
 * Material UI theme for the admin panel.
 *
 * The panel is light while the storefront is dark — a working surface people
 * stare at all day is a different job from a showroom. Every colour comes from
 * `admin-tokens.ts`; nothing is decided here.
 *
 * MUI is confined to this route group — a lint rule blocks importing it
 * anywhere else, because Emotion plus MUI in a storefront bundle would blow the
 * performance budget.
 */
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: BRAND.main,
      dark: BRAND.dark,
      light: BRAND.tint,
      contrastText: BRAND.contrast,
    },
    background: { default: SURFACE.canvas, paper: SURFACE.card },
    text: { primary: INK.primary, secondary: INK.secondary, disabled: INK.disabled },
    divider: LINE.hairline,
    success: { main: STATUS.success },
    warning: { main: STATUS.warning },
    error: { main: STATUS.error },
    info: { main: STATUS.info },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'var(--font-sans), Helvetica Neue, Helvetica, Arial, system-ui, sans-serif',
    h1: { fontFamily: 'var(--font-sans), sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'var(--font-sans), sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'var(--font-sans), sans-serif', fontWeight: 700 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    button: { textTransform: 'none', fontWeight: 600 },
    // Stat values and axis ticks line up column-wise; proportional figures wobble.
    overline: { letterSpacing: '0.08em', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          // The border lives on Card rather than Paper: Drawer, Menu and Popover
          // are Papers too, and a border on the drawer offsets its content by
          // 1px, which throws the sidebar header out of line with the content
          // header.
          border: `1px solid ${LINE.hairline}`,
          // A light surface rises by casting a real shadow, not by tinting
          // itself lighter — so no elevation gradient, and a shadow small
          // enough to read as a lift rather than a drop.
          boxShadow: SHADOW.card,
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        // The sidebar is the tinted plane; cards and the header are the white
        // ones on top of it. Same at every breakpoint, so the mobile overlay
        // still reads as the same sidebar.
        paper: { backgroundColor: SURFACE.canvas, backgroundImage: 'none' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, minHeight: 40 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 10, transition: 'background-color 200ms ease, color 200ms ease' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, letterSpacing: '0.01em' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // MUI's light input is unfilled, which reads as unfinished against
          // cards that are already white. Give it its own ground and a visible
          // resting border.
          backgroundColor: SURFACE.card,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: LINE.strong },
          '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
            borderColor: INK.disabled,
          },
          // Focus is drawn in ink, not in the brand red. On a white field a red
          // ring and a red label read as 'this is wrong', and `error.main` is
          // another red a hair away from it — focus and failure would look the
          // same. On the dark panel that red read as brand, which is why this
          // override did not need to exist before.
          '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: INK.primary,
            borderWidth: 2,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { '&.Mui-focused:not(.Mui-error)': { color: INK.primary } },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            // Much weaker than the dark panel's wash: the same red over white
            // reads roughly twice as loud.
            backgroundColor: BRAND.wash,
            '&:hover': { backgroundColor: BRAND.washHover },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        // Deliberately dark. A dark tooltip on a light panel is the convention
        // and the most legible option; inverting it with the rest would be a
        // downgrade.
        tooltip: {
          backgroundColor: INK.primary,
          fontSize: 12,
          fontWeight: 500,
          padding: '6px 10px',
        },
        arrow: { color: INK.primary },
      },
    },
  },
});

export function AdminTheme({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        {/* `enableColorScheme` so native controls, autofill and the scrollbar
            gutter render light too — the root layout declares a dark scheme. */}
        <CssBaseline enableColorScheme />
        <GlobalStyles
          styles={{
            // The root layout paints the storefront's near-black onto <body>
            // through Tailwind, which lives in a cascade layer. Emotion injects
            // unlayered, and unlayered beats every layer regardless of
            // specificity — so this is what actually lights the page, including
            // the overscroll gutter no component background can reach.
            body: { backgroundColor: SURFACE.canvas, color: INK.primary },

            // globals.css selects with white text on translucent red, which is
            // unreadable once the ground is light.
            '::selection': { backgroundColor: 'rgba(225,6,0,0.16)', color: INK.primary },

            // globals.css rings focus in #FF4438 — 3.4:1 here, too weak.
            ':focus-visible': { outlineColor: BRAND.main },

            // The global loader is shared with the storefront, so it reads its
            // ground and caption from variables that default to the dark
            // tokens. This is where the admin side relights them.
            ':root': {
              '--loader-ground': SURFACE.canvas,
              '--loader-ink': INK.secondary,
            },

            '*::-webkit-scrollbar': { width: 10, height: 10 },
            '*::-webkit-scrollbar-track': { background: 'transparent' },
            '*::-webkit-scrollbar-thumb': {
              background: 'rgba(16,24,40,0.18)',
              borderRadius: 8,
              border: '2px solid transparent',
              backgroundClip: 'content-box',
            },
            '*::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(16,24,40,0.30)',
              backgroundClip: 'content-box',
            },
          }}
        />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
