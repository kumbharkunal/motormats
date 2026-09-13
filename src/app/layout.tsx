import type { Metadata, Viewport } from 'next';

import { AppLoadSplash } from '@/components/feedback/app-load-splash';
import { Toaster } from '@/components/feedback/toaster';
import { SmoothScroll } from '@/components/layout/smooth-scroll';
import { StoreProvider } from '@/store/store-provider';
import { clientEnv } from '@/lib/env.client';
import { fontLogo, fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

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
  themeColor: '#F6F7F9',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(fontSans.variable, fontLogo.variable)}>
      <body className="bg-background font-sans text-foreground antialiased">
        <AppLoadSplash />
        <a
          href="#main"
          className="sr-only rounded bg-accent px-4 py-2 font-medium text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200]"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <StoreProvider>{children}</StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
