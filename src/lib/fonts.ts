import { Archivo, Plus_Jakarta_Sans } from 'next/font/google';

/** Body, UI and captions. Deck typography uses Helvetica Neue; this is the closest free match. */
export const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
});

/**
 * Display face. Every headline on the site is set in this, uppercase, at 800+.
 *
 * Archivo rather than Jakarta because the headline voice is a heavy, slightly
 * narrow grotesk — Jakarta's black weight is too round and too wide to stack
 * two lines of caps at 0.9 leading without the counters closing up. Loaded as a
 * variable axis so the weight can be tuned per size without a second request.
 */
export const fontDisplay = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
  weight: ['600', '700', '800', '900'],
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
});
