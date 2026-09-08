import type { Metadata, Viewport } from 'next';

import { Toaster } from '@/components/feedback/toaster';
import { StoreProvider } from '@/store/store-provider';
import { clientEnv } from '@/lib/env.client';
import { fontDisplay, fontSans } from '@/lib/fonts';
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
    'Precision-cut, custom-fit car mats engineered for a perfect fit. All-weather protection, anti-skid backing and a 1 year warranty.',
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
  themeColor: '#0A0A0B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(fontSans.variable, fontDisplay.variable)}>
      <body className="bg-background text-foreground font-sans antialiased">
        <a
          href="#main"
          className="bg-accent sr-only rounded px-4 py-2 font-medium text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200]"
        >
          Skip to content
        </a>
        <StoreProvider>{children}</StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
