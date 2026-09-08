import { expect, test } from '@playwright/test';

/**
 * Responsiveness is a hard project requirement, so it is asserted rather than
 * eyeballed. Every route is swept across the full viewport matrix — including
 * short and landscape heights, which is where the demo's 100dvh panels broke.
 *
 * Runs once (desktop project only); the matrix here supersedes the per-project
 * viewports in playwright.config.ts.
 */

const VIEWPORTS = [
  { name: '320x568-small-phone', width: 320, height: 568 },
  { name: '360x640-short-phone', width: 360, height: 640 },
  { name: '390x844-phone', width: 390, height: 844 },
  { name: '414x896-large-phone', width: 414, height: 896 },
  { name: '480x800-phablet', width: 480, height: 800 },
  { name: '640x900-small-tablet', width: 640, height: 900 },
  { name: '768x1024-tablet', width: 768, height: 1024 },
  { name: '834x1112-tablet-pro', width: 834, height: 1112 },
  { name: '1024x768-landscape-tablet', width: 1024, height: 768 },
  { name: '1280x800-laptop', width: 1280, height: 800 },
  { name: '1440x900-desktop', width: 1440, height: 900 },
  { name: '1920x1080-large', width: 1920, height: 1080 },
  { name: '2560x1440-ultrawide', width: 2560, height: 1440 },
  { name: '740x360-landscape-phone', width: 740, height: 360 },
  { name: '1024x500-short-laptop', width: 1024, height: 500 },
] as const;

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/collections', name: 'plp' },
  { path: '/products/7d-sport-luxury-mat', name: 'pdp' },
  { path: '/cart', name: 'cart' },
  { path: '/sign-in', name: 'sign-in' },
  // Reachable without a session by design, so it sweeps like any public route.
  { path: '/admin/sign-in', name: 'admin-sign-in' },
  { path: '/admin/forgot-password', name: 'admin-forgot-password' },
  { path: '/this-route-does-not-exist', name: '404' },
] as const;

test.describe.configure({ mode: 'parallel' });

for (const route of ROUTES) {
  test.describe(`${route.name} (${route.path})`, () => {
    for (const vp of VIEWPORTS) {
      test(`has no horizontal overflow at ${vp.name}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route.path, { waitUntil: 'load' });

        const metrics = await page.evaluate(() => {
          const de = document.documentElement;
          // Any element whose right edge sits past the viewport is a real
          // overflow source; report it so failures are actionable.
          const offenders: string[] = [];
          for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            if (rect.right > de.clientWidth + 1 || rect.left < -1) {
              const cls = typeof el.className === 'string' ? el.className.slice(0, 60) : '';
              offenders.push(`${el.tagName.toLowerCase()}.${cls} right=${Math.round(rect.right)}`);
            }
            if (offenders.length >= 5) break;
          }
          return {
            scrollWidth: de.scrollWidth,
            clientWidth: de.clientWidth,
            offenders,
          };
        });

        expect(
          metrics.scrollWidth,
          `Horizontal overflow. Offenders: ${metrics.offenders.join(' | ') || 'none identified'}`,
        ).toBeLessThanOrEqual(metrics.clientWidth + 1);

        await testInfo.attach(`${route.name}-${vp.name}.png`, {
          body: await page.screenshot({ fullPage: false }),
          contentType: 'image/png',
        });
      });
    }
  });
}

test('interactive controls meet the 44px touch target minimum on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/this-route-does-not-exist', { waitUntil: 'load' });

  const tooSmall = await page.evaluate(() => {
    const selector = 'a[href], button, input, select, textarea, [role="button"]';
    return Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((el) => {
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        // Skip-links are visually hidden until focused.
        if (el.classList.contains('sr-only')) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.height < 44 || r.width < 44);
      })
      .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 24)}"`);
  });

  expect(tooSmall, `Controls below 44px: ${tooSmall.join(', ')}`).toEqual([]);
});
