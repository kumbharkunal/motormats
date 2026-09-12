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

    // Only sections that render unconditionally. The second product zone is
    // dropped when the catalogue holds four or fewer active products, so
    // asserting on its copy would tie this test to the seed size.
    for (const phrase of [
      'Engineered to drive',
      'Four surfaces, one exact fit',
      'Made to fit',
      'Precision, all the way down',
      'Made to order, backed after it arrives',
      'Executive Carpet',
      'Shipping &amp; returns',
    ]) {
      expect(html, `missing from server HTML: ${phrase}`).toContain(phrase);
    }
  });

  test('the page actually scrolls and reaches the footer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

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

  test('the hero fills the viewport and runs under the floating header', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    const hero = page.locator('section', { has: page.locator('#hero-heading') }).first();
    const box = await hero.boundingBox();

    expect(box, 'hero section should be laid out').not.toBeNull();
    // Pulled up under the header, so it starts at the very top of the document.
    expect(Math.abs(box!.y)).toBeLessThanOrEqual(2);
    expect(box!.height).toBeGreaterThanOrEqual(880);
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

  test('the header retracts on the way down and comes back on the way up', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const header = page.locator('header').first();
    const top = async () => (await header.boundingBox())?.y ?? 0;

    // Over the hero it stays put, however far the hero itself has scrolled.
    expect(await top()).toBe(0);
    await expect(header).toHaveAttribute('data-over-hero', 'true');

    await page.mouse.move(720, 450);
    const wheel = async (dy: number, times: number) => {
      for (let i = 0; i < times; i += 1) {
        await page.mouse.wheel(0, dy);
        await page.waitForTimeout(70);
      }
      await page.waitForTimeout(900);
    };

    await wheel(400, 10);
    await expect(header).toHaveAttribute('data-over-hero', 'false');
    expect(await top(), 'header should retract past the hero').toBeLessThan(-40);

    await wheel(-400, 3);
    expect(await top(), 'scrolling up should bring it back').toBe(0);
  });

  test('the header never retracts on a route without a hero', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/our-story', { waitUntil: 'load' });
    await page.waitForTimeout(400);

    const header = page.locator('header').first();
    await expect(header).toHaveAttribute('data-over-hero', 'false');
    expect((await header.boundingBox())?.y).toBe(0);
  });
});
