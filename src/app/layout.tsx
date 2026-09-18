import type { Metadata, Viewport } from 'next';

import { AppLoadSplash } from '@/components/feedback/app-load-splash';
import { TapHaptics } from '@/components/feedback/tap-haptics';
import { Toaster } from '@/components/feedback/toaster';
import { HashScroll } from '@/components/layout/hash-scroll';
import { SmoothScroll } from '@/components/layout/smooth-scroll';
import { StoreProvider } from '@/store/store-provider';
import { clientEnv } from '@/lib/env.client';
import { fontDisplay, fontSans } from '@/lib/fonts';

import '@/styles/globals.css';

const appUrl = clientEnv.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Motormats — Premium Custom-Fit Car Mats',
    template: '%s | Motormats',
  },
  description:
    'Precision-cut, custom-fit car mats engineered for a perfect fit. All-weather protection and anti-skid backing.',
  applicationName: 'Motormats',
  openGraph: {
    type: 'website',
    siteName: 'Motormats',
    locale: 'en_IN',
    url: appUrl,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * `suppressHydrationWarning` covers this element's own attributes only, one
   * level deep. It is here because `AppLoadSplash` ships a `beforeInteractive`
   * script that stamps `data-splash` on the root before React hydrates — which
   * is the whole point of it, since an attribute set after hydration arrives too
   * late to stop the overlay painting. React then finds an attribute on <html>
   * that its own output does not have and reports a mismatch. This is the
   * documented answer for a root-marking script, and it suppresses nothing else
   * in the tree.
   */
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable}`}
    >
      <body className="bg-background font-sans text-foreground antialiased">
        <AppLoadSplash />
        <a
          href="#main"
          className="sr-only rounded bg-accent px-4 py-2 font-medium text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200]"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <HashScroll />
        <TapHaptics />
        <StoreProvider>{children}</StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
