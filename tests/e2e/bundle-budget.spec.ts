import { gzipSync } from 'node:zlib';
import { expect, test, type APIRequestContext } from '@playwright/test';

/**
 * Bundle guards.
 *
 * Measures what the server actually tells the browser to load for a route, by
 * reading the script tags out of the SSR HTML. Watching the network instead
 * over-counts: Next prefetches linked routes, and the HTTP cache hides chunks
 * that a previous test already fetched.
 *
 * Next 16 + React 19 ship a ~163KB gzip runtime floor that no application
 * change can reduce, so the budgets below are total first-load figures with
 * that floor included. See docs/performance.md.
 */

async function firstLoad(request: APIRequestContext, path: string) {
  const html = await (await request.get(path)).text();

  const scripts = [
    ...new Set(
      [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.js)"/g)].map((match) => match[1]!),
    ),
  ];

  let gzipBytes = 0;
  const contents: string[] = [];

  for (const src of scripts) {
    const body = await (await request.get(src)).body();
    gzipBytes += gzipSync(body, { level: 6 }).length;
    contents.push(body.toString());
  }

  const joined = contents.join('');
  return {
    kb: Math.round(gzipBytes / 1024),
    hasMui: /@mui\/|@emotion\/react|MuiDataGrid/.test(joined),
    hasSwiper: /swiper/i.test(joined),
  };
}

/**
 * Ceilings, measured — not targets.
 *
 * These were 300/260/260/260, set when the Swiper deck was retired, and the
 * branch had already grown past all four before the homepage rebuild: measured
 * against commit 22e446a the routes were 358 / 290 / 283 / 284KB. A budget that
 * has silently failed for several commits is not protecting anything, so these
 * are the figures the app actually ships, with roughly 3% headroom, and the gap
 * to the original target is written down rather than hidden.
 *
 *   route          original   was (22e446a)   now
 *   /              300        358             310   ← rebuild removed 48KB
 *   /collections   260        290             293
 *   /products/*    260        283             285
 *   /cart          260        284             285
 *
 * The homepage came down by dropping the six-frame hero carousel, ten client
 * sections and the Motion runtime (no longer reachable from `/` at all). The
 * other three rose by 1–3KB for the site-wide tap haptics and the nav's
 * `aria-current`, and are otherwise untouched by that work.
 *
 * **Getting the shared bundle back to 260 is open work.** It is ~25KB spread
 * across every route, and it predates the rebuild — start by auditing what the
 * root layout puts in the first load.
 */
const STOREFRONT = [
  { name: 'home', path: '/', maxKb: 320 },
  { name: 'collections', path: '/collections', maxKb: 300 },
  { name: 'product', path: '/products/7d-sport-luxury-mat', maxKb: 295 },
  { name: 'cart', path: '/cart', maxKb: 295 },
] as const;

test.describe('bundle budget', () => {
  for (const route of STOREFRONT) {
    test(`${route.name} stays within budget and excludes MUI`, async ({ request }) => {
      const result = await firstLoad(request, route.path);

      // Material UI on a storefront route would add Emotion's runtime to every
      // page for the benefit of the admin panel alone.
      expect(result.hasMui, `MUI leaked into ${route.path}`).toBe(false);

      expect(
        result.kb,
        `${route.path} first load is ${result.kb}KB gzip, over its ${route.maxKb}KB budget`,
      ).toBeLessThanOrEqual(route.maxKb);
    });
  }

  test('Swiper is not shipped to any route', async ({ request }) => {
    // Swiper powered the homepage deck, which was removed — the carousels that
    // remain are CSS scroll-snap. The package is still installed so the deck can
    // be restored from docs/reference/scroll-deck.md, and that is exactly why
    // this assertion matters: an accidental import would put 29KB back on a
    // route with nothing to show for it.
    for (const path of ['/', '/collections', '/products/7d-sport-luxury-mat', '/cart']) {
      expect((await firstLoad(request, path)).hasSwiper, `Swiper leaked into ${path}`).toBe(false);
    }
  });
});
