import { Inter, Montserrat } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

/** Logo wordmark only — wide geometric uppercase that matches the raster logo. */
export const fontLogo = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700', '800'],
  variable: '--font-logo',
  fallback: ['system-ui', 'sans-serif'],
});

