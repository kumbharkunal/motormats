import { expect, test, type Page } from '@playwright/test';

/**
 * The two homepage controls that did not work with a thumb.
 *
 * Every case here is a gesture a real hand makes and the previous build got
 * wrong: a tap that did nothing, a diagonal swipe that killed the drag until the
 * finger lifted, and a brand tile that missed because a GSAP reveal was still
 * transforming its wrapper.
 *
 * Synthetic pointer events would pass against almost any implementation, so
 * these drive Chromium's real touch pipeline over CDP.
 */

type Point = { x: number; y: number };

async function touchSwipe(page: Page, from: Point, to: Point, steps = 14) {
  const client = await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: from.x, y: from.y }],
  });

  for (let step = 1; step <= steps; step += 1) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        {
          x: from.x + ((to.x - from.x) * step) / steps,
          y: from.y + ((to.y - from.y) * step) / steps,
        },
      ],
    });
  }

  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

async function touchTap(page: Page, at: Point) {
  const client = await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: at.x, y: at.y }],
  });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

/** Scroll the comparison into view and let its one-shot hint finish. */
async function openCompare(page: Page) {
  await page.goto('/');
  await page.locator('#app-splash').waitFor({ state: 'hidden' }).catch(() => {});

  const slider = page.locator('[role="slider"][aria-label*="Compare"]');
  await slider.scrollIntoViewIfNeeded();
  // The hint opens the split and closes it again. Polling for "50" would match
  // the value it already has before the hint starts, so wait the hint out.
  await page.waitForTimeout(1700);
  await expect(slider).toHaveAttribute('aria-valuenow', '50', { timeout: 6000 });

  const track = page.locator('[data-split-track]');
  const box = await track.boundingBox();
  expect(box).not.toBeNull();
  return { slider, track, box: box! };
}

const value = async (page: Page) =>
  Number(
    await page.locator('[role="slider"][aria-label*="Compare"]').getAttribute('aria-valuenow'),
  );

/** CDP touch input is only meaningful in a context that reports touch. */
const touchOnly = (testInfo: { project: { use: { hasTouch?: boolean } } }) =>
  testInfo.project.use.hasTouch !== true;

test.describe('drag to compare', () => {
  test('a tap on the track moves the split to the finger', async ({ page }) => {
    test.skip(touchOnly(test.info()), 'needs a touch-enabled context');
    const { box } = await openCompare(page);

    // Three quarters across: unambiguously right of the default seam.
    await touchTap(page, { x: box.x + box.width * 0.78, y: box.y + box.height / 2 });

    await expect
      .poll(() => value(page), { timeout: 4000 })
      .toBeGreaterThan(65);
  });

  test('dragging the handle moves the split proportionally', async ({ page }) => {
    test.skip(touchOnly(test.info()), 'needs a touch-enabled context');
    const { box } = await openCompare(page);
    const mid = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

    // A quarter of the track to the left, straight.
    await touchSwipe(page, mid, { x: mid.x - box.width * 0.25, y: mid.y });

    await expect.poll(() => value(page), { timeout: 4000 }).toBeLessThan(35);
  });

  test('a diagonal swipe still moves the split', async ({ page }) => {
    test.skip(touchOnly(test.info()), 'needs a touch-enabled context');
    const { box } = await openCompare(page);
    const start = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.45 };

    // A thumb arcs. This is the gesture the old axis test rejected outright and
    // could never recover from.
    await touchSwipe(page, start, { x: start.x + box.width * 0.3, y: start.y + 34 });

    await expect.poll(() => value(page), { timeout: 4000 }).toBeGreaterThan(60);
  });

  test('a vertical swipe scrolls the page and leaves the split alone', async ({ page }) => {
    test.skip(touchOnly(test.info()), 'needs a touch-enabled context');
    const { box } = await openCompare(page);
    const before = await value(page);
    // Clear of the handle. A swipe that starts *on* the handle is a drag, which
    // is what every slider does and what `touch-action: none` there guarantees;
    // this is the other case — a thumb scrolling the page over the artwork.
    const start = { x: box.x + box.width * 0.22, y: box.y + box.height * 0.3 };
    const scrollBefore = await page.evaluate(() => window.scrollY);

    await touchSwipe(page, start, { x: start.x + 6, y: start.y - 190 });
    await page.waitForTimeout(700);

    expect(await value(page)).toBe(before);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore);
  });

  test('the handle is a keyboard slider', async ({ page }) => {
    const { slider } = await openCompare(page);

    await slider.focus();
    const before = await value(page);
    for (let press = 0; press < 5; press += 1) await page.keyboard.press('ArrowRight');

    // step is 2, so five presses is ten.
    expect(await value(page)).toBe(before + 10);

    await page.keyboard.press('Home');
    expect(await value(page)).toBe(0);

    await page.keyboard.press('End');
    expect(await value(page)).toBe(100);
  });
});

test.describe('find your fit', () => {
  async function openWizard(page: Page) {
    await page.goto('/');
    await page.locator('#app-splash').waitFor({ state: 'hidden' }).catch(() => {});
    const group = page.getByRole('radiogroup', { name: 'Car brand' });
    await group.scrollIntoViewIfNeeded();
    return group;
  }

  test('a tile tapped the instant it scrolls into view still registers', async ({ page }) => {
    // No settle wait on purpose. This is the exact window in which the old
    // build lost taps: the wizard sat inside a [data-reveal] wrapper that GSAP
    // transformed for 900ms, and a transformed ancestor desynchronises a tap
    // target from where it is painted.
    test.skip(touchOnly(test.info()), 'needs a touch-enabled context');

    const group = await openWizard(page);
    const tile = group.getByRole('radio').first();
    // The tile, not the group: at a short viewport the grid is taller than the
    // screen, so scrolling the group into view can leave its first row above it.
    await tile.scrollIntoViewIfNeeded();
    const box = await tile.boundingBox();
    expect(box).not.toBeNull();

    await touchTap(page, { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 });

    await expect(page.getByText(/Step\s+2\s+\/\s+6/)).toBeVisible({ timeout: 5000 });
  });

  test('the step it opens is on screen afterwards', async ({ page }) => {
    const group = await openWizard(page);
    await page.waitForTimeout(600);

    await group.getByRole('radio').first().click();

    // The height tween plus the deliberate scroll should leave the reader
    // looking at the model list, not wherever scroll anchoring dropped them.
    const heading = page.locator('[data-step-heading]').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(900);

    const placement = await heading.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top, viewport: window.innerHeight };
    });
    expect(placement.top).toBeGreaterThan(-1);
    expect(placement.top).toBeLessThan(placement.viewport);
  });

  test('the brand grid is one radio group, traversed with arrows', async ({ page }) => {
    const group = await openWizard(page);
    await page.waitForTimeout(600);

    const tiles = group.getByRole('radio');
    await tiles.first().focus();
    await page.keyboard.press('ArrowRight');

    // Roving tabindex: focus moves within the group rather than to the next
    // tab stop, and only one tile is ever tabbable.
    await expect(tiles.nth(1)).toBeFocused();
    expect(await group.locator('[role="radio"][tabindex="0"]').count()).toBe(1);
  });
});
