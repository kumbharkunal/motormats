'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

/**
 * Material UI theme for the admin panel, tuned to the storefront's palette so
 * the two do not look like different products.
 *
 * MUI is confined to this route group — a lint rule blocks importing it
 * anywhere else, because Emotion plus MUI in a storefront bundle would blow the
 * performance budget.
 */
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: { main: '#E10600', dark: '#B00400', light: '#FF4438' },
    background: { default: '#0A0A0B', paper: '#141416' },
    text: { primary: '#F5F5F4', secondary: '#A1A1AA' },
    divider: 'rgba(255,255,255,0.08)',
    success: { main: '#0CA30C' },
    warning: { main: '#FAB219' },
    error: { main: '#D03B3B' },
    info: { main: '#3987E5' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'var(--font-inter), system-ui, sans-serif',
    h1: { fontFamily: 'var(--font-display), sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'var(--font-display), sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'var(--font-display), sans-serif', fontWeight: 700 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    button: { textTransform: 'none', fontWeight: 600 },
    // Stat values and axis ticks line up column-wise; proportional figures wobble.
    overline: { letterSpacing: '0.08em', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      // Deliberately no blanket border: Drawer, Menu and Popover are Papers too,
      // and a border on the drawer offsets its content by 1px, which throws the
      // sidebar header out of line with the content header.
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 120px)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
        },
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
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(225,6,0,0.14)',
            '&:hover': { backgroundColor: 'rgba(225,6,0,0.2)' },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1F1F23',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: 12,
          fontWeight: 500,
          padding: '6px 10px',
        },
      },
    },
  },
});

export function AdminTheme({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            // The default dark scrollbar is a bright slab against these surfaces.
            '*::-webkit-scrollbar': { width: 10, height: 10 },
            '*::-webkit-scrollbar-track': { background: 'transparent' },
            '*::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.14)',
              borderRadius: 8,
              border: '2px solid transparent',
              backgroundClip: 'content-box',
            },
            '*::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255,255,255,0.24)',
              backgroundClip: 'content-box',
            },
          }}
        />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
