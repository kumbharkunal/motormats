import { Geist, Instrument_Serif } from 'next/font/google';

/**
 * Body, UI, prices and every tracked label.
 *
 * Geist is a neutral grotesque with genuinely good tabular figures, which is
 * what a price list needs — the previous face set rupee amounts with
 * proportional digits, so a column of prices never aligned.
 */
export const fontSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
});

/**
 * Display face.
 *
 * A high-contrast editorial serif, against a grotesque for everything
 * functional. This pairing is the register the category actually sells in —
 * both of the closest comparable houses set their headlines in a serif of this
 * kind — and it reads as considered rather than sporty, which is the difference
 * between a floor mat and a furnishing.
 *
 * It replaces TeX Gyre Heros: a free Helvetica clone that shipped only 400 and
 * 700 as four uncompressed OTFs, while the stylesheet asked it for 800 with
 * synthesis switched off — so the site's largest type was silently rendering a
 * weight lighter than it was designed at. One weight is all this face needs;
 * at display sizes the contrast carries the emphasis.
 */
export const fontDisplay = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
  weight: ['400'],
  style: ['normal', 'italic'],
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});
