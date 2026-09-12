import { Cormorant_Garamond, Inter } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

/*
 * Headings only.
 *
 * A high-contrast Garamond set at 400 and sentence case — it carries the page
 * on shape rather than weight, which is why headings here are large and light
 * rather than heavy and tracked out. Everything that has to stay crisp at small
 * sizes (labels, prices, the wordmark, the whole admin panel) stays on Inter;
 * a display serif at 12px is just noise.
 */
export const fontDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  fallback: ['Georgia', 'ui-serif', 'serif'],
});
