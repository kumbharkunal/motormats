import { Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';

/** Body, UI and captions. Deck typography uses Helvetica Neue; this is the closest free match. */
export const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
});

/**
 * Display face. TeX Gyre Heros — a free Helvetica/Nimbus Sans derivative.
 * Available weights: 400 (regular) and 700 (bold).
 */
export const fontDisplay = localFont({
  src: [
    { path: '../fonts/texgyreheros-regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/texgyreheros-italic.otf', weight: '400', style: 'italic' },
    { path: '../fonts/texgyreheros-bold.otf', weight: '700', style: 'normal' },
    { path: '../fonts/texgyreheros-bolditalic.otf', weight: '700', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-heros',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
});
