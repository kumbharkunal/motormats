import { networkInterfaces } from 'node:os';

import type { NextConfig } from 'next';

/**
 * Managed Node hosts (Hostinger) import this file and merge it into a generated
 * config that adds `output: 'standalone'`. A function config breaks that merge,
 * so the default export must always be a plain object.
 */
/**
 * Tunnel hostnames, for showing the dev server to a phone or to a client.
 *
 * A tunnel's host is generated per session, so it cannot be enumerated the way
 * a network interface can — these are wildcards for the services that hand one
 * out. Without them a tunnelled dev server serves markup and never hydrates,
 * which looks exactly like a broken site rather than a blocked origin.
 */
const TUNNEL_ORIGINS = [
  '*.ngrok-free.dev',
  '*.ngrok-free.app',
  '*.ngrok.app',
  '*.ngrok.io',
  '*.trycloudflare.com',
  '*.loca.lt',
];

function devOrigins(): string[] {
  const origins = new Set(['localhost', '127.0.0.1', ...TUNNEL_ORIGINS]);

  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries ?? []) {
      // IPv4 only, and not the loopback adapter — these are the addresses a
      // phone on the same Wi-Fi can actually reach.
      if (entry.family === 'IPv4' && !entry.internal) origins.add(entry.address);
    }
  }

  return [...origins];
}

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
    qualities: [60, 72, 75, 80, 82, 88, 90],
  },

  /*
   * Every address this machine answers on, so the dev server can be opened from
   * another device on the same network.
   *
   * Next blocks cross-origin requests to dev-only assets, and the origin it
   * allows by default is the one it was started with — `localhost`. Open the
   * same dev server from a phone at `http://<lan-ip>:3000` and the HMR bootstrap
   * is refused, which means **the page never hydrates**: the markup renders, and
   * then nothing responds. Every button, every gesture, every add-to-cart is
   * inert, on a page that otherwise looks completely normal. It reads as "it
   * works on the laptop but not on my phone", and it is not a mobile bug at all.
   *
   * Computed rather than hard-coded because the address changes with the
   * network — a fixed list is wrong again the next time you join a different
   * Wi-Fi. This still exports a plain object, which the managed-host merge
   * requires.
   *
   * Dev-only. A production `next start` serves any origin and is unaffected.
   */
  allowedDevOrigins: devOrigins(),

  experimental: {
    optimizePackageImports: ['lucide-react', 'motion', 'swiper'],
  },

  headers() {
    return Promise.resolve([{ source: '/:path*', headers: securityHeaders }]);
  },
};

export default nextConfig;
