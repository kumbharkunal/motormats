import type { NextConfig } from 'next';

/**
 * Managed Node hosts (Hostinger) import this file and merge it into a generated
 * config that adds `output: 'standalone'`. A function config breaks that merge,
 * so the default export must always be a plain object.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // All image transformation is delegated to a CDN (ImageKit for the files in
  // `public/`, Cloudinary for catalogue asset ids) so the app server never
  // spends CPU/RAM on sharp. See src/lib/image-loader.ts.
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    formats: ['image/avif', 'image/webp'],
    // Next 16 rejects any `quality` not declared here and silently falls back
    // to 75. The photography is graded, so the plates are worth 88 and the
    // gallery thumbnails are fine at 60.
    qualities: [60, 75, 88, 90],
  },

  // The Playwright suite drives `http://127.0.0.1:3000`. Next's dev server
  // treats that as a cross-origin dev request and refuses to serve the HMR
  // bootstrap, which stops the page hydrating at all — every scroll and header
  // assertion then fails against a static document. Dev-only; production
  // serving is unaffected.
  allowedDevOrigins: ['127.0.0.1'],

  experimental: {
    optimizePackageImports: ['lucide-react', 'motion', 'swiper'],
  },

  headers() {
    return Promise.resolve([{ source: '/:path*', headers: securityHeaders }]);
  },
};

export default nextConfig;
