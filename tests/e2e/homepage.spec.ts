import { expect, test } from '@playwright/test';

/**
 * The homepage was a full-screen Swiper deck until September 2026; it is now a
 * normally scrolling page with Lenis smooth scroll. The archived deck and the
 * reasoning are in docs/reference/scroll-deck.md.
 *
 * These tests cover what the deck's own suite used to guarantee and what the
 * scrolling version newly has to get right: every section reaches the server
 * HTML, nothing overflows, the hero reaches the top of the viewport under the
 * floating header, and smooth scroll yields to `prefers-reduced-motion`.
 */
test.describe('homepage', () => {
  test('server HTML carries every section, so crawlers see the whole page', async ({ request }) => {
    const html = await (await request.get('/')).text();

    // One phrase per band, in running order. The page is nine bands now, from
    // seventeen: eight editorial sections that repeated the same shape were
    // folded into one photography band, and three that argued fit in three
    // different registers were folded into the range grid.
    //
    // Left out: the range grid itself, which is fed by the catalogue and
    // renders nothing when it holds no active products — asserting on it would
    // tie this test to the seed size.
    for (const phrase of [
      'Your car.',
      'A better floor.',
      'See installs in motion',
      'Generic mats compared with Motormats',
      'to finish your interior.',
      'Stories from the floorpan',
      'to finished mat.',
      'Your car deserves better.',
      'Cut after you order',
    ]) {
      expect(html, `missing from server HTML: ${phrase}`).toContain(phrase);
    }
  });

  test('the page actually scrolls and reaches the footer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    // `load` is not "rendered". The page awaits the catalogue, so a cold request
    // is still streaming when it fires and the whole tree sits inside a hidden
    // Suspense template with no layout at all.
    await page.locator('#hero-heading').waitFor({ state: 'visible' });

    const scrollable = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight + 200,
    );
    expect(scrollable, 'the homepage should be a long scrolling page').toBe(true);

    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('the wheel scrolls the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    /*
     * A real wheel event, not `scrollTo`. Lenis cancels the wheel and drives the
     * scroll itself, so the two can disagree completely: `body { overflow-x:
     * hidden }` forced overflow-y to `auto`, made <body> the scrolling element
     * and left the wheel dead while every programmatic scroll still worked. A
     * test that only called scrollTo passed throughout.
     */
    await page.mouse.move(720, 450);
    for (let i = 0; i < 6; i += 1) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(900);

    const y = await page.evaluate(() => window.scrollY);
    expect(y, 'the wheel should move the page').toBeGreaterThan(300);
  });

  test('the hero fills the screen below the header', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    await page.locator('#hero-heading').waitFor({ state: 'visible' });

    const hero = page.locator('section', { has: page.locator('#hero-heading') });
    const box = await hero.boundingBox();
    const header = await page.locator('header').first().boundingBox();

    expect(box, 'hero section should be laid out').not.toBeNull();
    expect(header, 'header should be laid out').not.toBeNull();

    // The band is an opaque ink ground on every route, so a cover running
    // beneath it would be hidden behind it rather than showing through — it
    // starts where the header ends.
    expect(box!.y).toBeGreaterThanOrEqual(header!.height - 2);
    expect(box!.y).toBeLessThanOrEqual(header!.height + 2);

    // And it still fills what is left of the screen.
    expect(box!.height).toBeGreaterThanOrEqual(900 - header!.height - 2);
  });

  test('no section overflows its own width at any breakpoint', async ({ page }) => {
    for (const [width, height] of [
      [1440, 900],
      [1280, 800],
      [1024, 768],
      [768, 1024],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });

      await page.locator('#hero-heading').waitFor({ state: 'visible' });

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow at ${width}x${height}`).toBeLessThanOrEqual(1);
    }
  });

  test('smooth scroll yields to prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    // Lenis stamps this class on <html> only when it takes over the document.
    await expect(page.locator('html')).not.toHaveClass(/lenis/);

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.reload({ waitUntil: 'load' });
    await expect(page.locator('html')).toHaveClass(/lenis/);
  });

  test('the header never leaves the screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const header = page.locator('header').first();
    const top = async () => (await header.boundingBox())?.y ?? 0;

    expect(await top()).toBe(0);

    await page.mouse.move(720, 450);
    const wheel = async (dy: number, times: number) => {
      for (let i = 0; i < times; i += 1) {
        await page.mouse.wheel(0, dy);
        await page.waitForTimeout(70);
      }
      await page.waitForTimeout(900);
    };

    // It used to retract on scroll down. It must not any more, in either
    // direction.
    await wheel(400, 10);
    expect(await top(), 'header should stay pinned to the top on scroll down').toBe(0);

    await wheel(400, 10);
    expect(await top(), 'header should stay pinned deeper down the page').toBe(0);

    await wheel(-400, 3);
    expect(await top(), 'header should stay pinned on scroll up').toBe(0);
  });

  test('the header is pinned and painted on every other route too', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/our-story', { waitUntil: 'load' });
    await page.waitForTimeout(400);

    const header = page.locator('header').first();
    expect((await header.boundingBox())?.y).toBe(0);

    // One opaque ground on every route: there is no transparent state left to
    // get wrong, which is the whole reason the overlay machinery went.
    const ground = await header.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(ground).not.toBe('rgba(0, 0, 0, 0)');
  });
});
