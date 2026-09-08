import { expect, test } from '@playwright/test';

/**
 * The homepage deck carries the project's highest-risk requirement: it must
 * look like the approved reference and stay smooth. Several of these tests
 * encode the project's smoothness contract so it cannot regress silently.
 */

const DECK = '.swiper.swiper-creative';

test.describe('homepage deck', () => {
  test('initialises with the reference configuration', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    await expect(page.locator(DECK)).toHaveClass(/swiper-initialized/);

    const config = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement & { swiper?: never }>('.swiper');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- reading Swiper's runtime instance off the DOM node
      const swiper = (el as any).swiper;
      const slide = document.querySelector('.swiper-slide');
      return {
        effect: swiper.params.effect,
        direction: swiper.params.direction,
        speed: swiper.params.speed,
        limitProgress: swiper.params.creativeEffect.limitProgress,
        nextTranslate: swiper.params.creativeEffect.next.translate,
        keyboard: swiper.params.keyboard.enabled,
        slideCount: swiper.slides.length,
        slideTimingFunction: slide ? getComputedStyle(slide).transitionTimingFunction : '',
      };
    });

    expect(config.effect).toBe('creative');
    expect(config.direction).toBe('vertical');
    expect(config.speed).toBe(500);
    // Only the neighbouring panel is transformed.
    expect(config.limitProgress).toBe(1);
    expect(config.nextTranslate).toEqual([0, '100%', 0]);
    expect(config.keyboard).toBe(true);
    expect(config.slideCount).toBe(4);
    // The demo set its easing on .swiper-wrapper, which never moves under
    // virtualTranslate, so the curve never applied. It must reach the slides.
    expect(config.slideTimingFunction).toBe('cubic-bezier(0.25, 1, 0.5, 1)');
  });

  test('advances by keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    await expect(page.locator(DECK)).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.swiper-slide-active #craftsmanship-heading')).toBeVisible();
  });

  test('every panel fits inside the deck without clipping', async ({ page }) => {
    for (const [width, height] of [
      [1440, 900],
      [1280, 800],
      [1024, 768],
      [768, 1024],
      [390, 844],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      // Guard against a vacuous pass: the deck must actually be present.
      await expect(page.locator('.swiper-slide').first()).toBeAttached();

      const clipped = await page.evaluate(() => {
        const problems: string[] = [];
        document.querySelectorAll<HTMLElement>('.swiper-slide').forEach((slide, index) => {
          // The footer panel is deliberately scrollable on small screens.
          if (slide.querySelector('.swiper-no-mousewheel, footer')) return;
          const content = slide.firstElementChild as HTMLElement | null;
          if (!content) return;
          if (content.scrollHeight > slide.clientHeight + 2) {
            problems.push(`panel ${index}: ${content.scrollHeight}px in ${slide.clientHeight}px`);
          }
        });
        return problems;
      });

      expect(clipped, `Clipped panels at ${width}x${height}`).toEqual([]);
    }
  });

  test('falls back to normal scrolling on a short viewport', async ({ page }) => {
    await page.setViewportSize({ width: 740, height: 360 });
    await page.goto('/', { waitUntil: 'load' });

    await expect(page.locator('.flow-shell')).toBeVisible();
    await expect(page.locator(DECK)).toHaveCount(0);

    const scrollable = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight + 50,
    );
    expect(scrollable).toBe(true);
  });

  test('falls back to normal scrolling under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    await expect(page.locator('.flow-shell')).toBeVisible();
    await expect(page.locator(DECK)).toHaveCount(0);
  });

  test('server HTML carries every panel, so crawlers see the whole page', async ({ request }) => {
    const html = await (await request.get('/')).text();

    for (const phrase of [
      'Engineered to Drive',
      'Precision Craftsmanship',
      'Our Products',
      'Executive Carpet',
      'Shipping &amp; returns',
    ]) {
      expect(html, `missing from server HTML: ${phrase}`).toContain(phrase);
    }
  });

  test('smoothness contract: no backdrop-filter over or inside the deck', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    await expect(page.locator('.deck-shell')).toBeVisible();

    const offenders = await page.evaluate(() => {
      const scope = document.querySelector('.deck-shell');
      if (!scope) return ['deck did not mount'];
      return Array.from(scope.querySelectorAll<HTMLElement>('*'))
        .filter((el) => {
          const value = getComputedStyle(el).backdropFilter;
          return Boolean(value) && value !== 'none';
        })
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
    });

    expect(offenders, 'backdrop-filter inside the deck forces a per-frame re-sample').toEqual([]);
  });

  test('smoothness contract: will-change is not left on at rest', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('.deck-shell')).toBeVisible();
    await page.waitForTimeout(600);

    const promoted = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll<HTMLElement>('.deck-shell *')).filter((el) => {
          const value = getComputedStyle(el).willChange;
          return value !== 'auto' && value !== '';
        }).length,
    );

    expect(promoted, 'will-change must be granted only during a transition').toBe(0);
  });
});
