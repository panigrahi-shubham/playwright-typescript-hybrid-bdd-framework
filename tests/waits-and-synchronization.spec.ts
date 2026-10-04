import { test, expect, Page } from '@playwright/test';

// Chapter 11: waits and synchronization.
// A wait means: "pause this test step until a specific browser condition is true."
// Sauce Demo covers normal navigation; The Internet's dynamic loading pages
// provide a visible loader and results that appear after a delay.
const SAUCE_DEMO = 'https://www.saucedemo.com';
const DYNAMIC_HIDDEN = 'https://the-internet.herokuapp.com/dynamic_loading/1';
const DYNAMIC_RENDERED = 'https://the-internet.herokuapp.com/dynamic_loading/2';

// This helper puts the repeated login steps in one place. Each action is awaited
// so the next line starts after that action has completed. No manual sleep is
// needed: Playwright waits for fields and buttons to be ready before using them.
async function submitLogin(page: Page) {
  await page.goto(SAUCE_DEMO);
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
}

test.describe('Chapter 11: waits and synchronization', () => {
  test('auto-wait: actions wait for elements automatically', async ({ page }) => {
    await page.goto(SAUCE_DEMO);

    // Auto-wait is Playwright's default behavior. For fill() and click(), it
    // waits until the target exists, is visible, stable, enabled, and able to
    // receive the action. Usually you can write the action directly.
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    // This assertion also retries. It keeps checking the title until it becomes
    // "Products" or the assertion timeout expires. This is better than guessing
    // how many milliseconds the site needs and sleeping for that long.
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('locator.waitFor(): wait for a loader and result to change state', async ({ page }) => {
    await page.goto(DYNAMIC_HIDDEN);

    const startButton = page.getByRole('button', { name: 'Start' });
    const loadingIndicator = page.locator('#loading');
    const result = page.locator('#finish');

    // waitFor() is an explicit wait for one locator to reach one state.
    // "visible" means the element is present and visible to the user.
    await startButton.waitFor({ state: 'visible' });

    // Clicking Start begins a simulated slow operation on this practice page.
    await startButton.click();

    // First wait until the spinner becomes visible, then wait until it becomes
    // hidden. "hidden" also passes if the element is removed from the page.
    await loadingIndicator.waitFor({ state: 'visible' });
    await loadingIndicator.waitFor({ state: 'hidden' });

    // Give this particular result up to 10 seconds to appear. The default
    // timeout applies if you do not supply timeout. Then assert its exact text.
    await result.waitFor({ state: 'visible', timeout: 10_000 });
    await expect(result).toHaveText('Hello World!');
  });

  test('locator.waitFor(): wait until a result is attached to the DOM', async ({ page }) => {
    await page.goto(DYNAMIC_RENDERED);
    await page.getByRole('button', { name: 'Start' }).click();

    // "attached" only means the element now exists in the page's DOM; it may
    // still be hidden. The next assertion separately waits for it to be visible.
    const result = page.locator('#finish');
    await result.waitFor({ state: 'attached' });
    await expect(result).toBeVisible();
  });

  test('waitForURL(): wait for an exact destination', async ({ page }) => {
    await submitLogin(page);

    // Use an exact URL when the destination is known. waitForURL() waits for
    // navigation to that address; expect(page).toHaveURL() verifies it as well.
    await page.waitForURL('https://www.saucedemo.com/inventory.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('waitForURL(): wait for a matching URL pattern', async ({ page }) => {
    await submitLogin(page);

    // A regular expression is useful when only part of the URL matters or
    // query parameters may vary. /inventory/ matches any URL containing it.
    await page.waitForURL(/inventory/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('waitForLoadState(): observe document loading milestones', async ({ page }) => {
    // "domcontentloaded" means the browser parsed the HTML. It does not mean
    // every image or stylesheet has finished loading. "load" waits for the
    // page's load event, including its dependent resources. These calls return
    // immediately if the requested state has already happened.
    await page.goto(SAUCE_DEMO, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');

    await submitLogin(page);
    await page.waitForURL(/inventory/);

    // "networkidle" waits for network activity to quiet down. Analytics and
    // background requests can make this unreliable on real apps, so prefer
    // waiting for the actual result you care about, as the next line does.
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.inventory_item').first()).toBeVisible();
  });

  test('waitForSelector(): legacy selector wait', async ({ page }) => {
    await page.goto(DYNAMIC_HIDDEN);

    // This older page method waits for a CSS selector. The first call waits for
    // #start to exist (attached to the DOM); the second waits until #finish is
    // visible. New tests can usually use locator.waitFor() or expect() instead.
    await page.waitForSelector('#start');
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForSelector('#finish', { state: 'visible' });
    await expect(page.locator('#finish')).toContainText('Hello World!');
  });

  test('prefer assertions over fixed sleeps', async ({ page }) => {
    await page.goto(DYNAMIC_HIDDEN);
    await page.getByRole('button', { name: 'Start' }).click();

    // Avoid page.waitForTimeout(6000): it always wastes six seconds if the
    // result is ready sooner, but can still fail if the site takes longer.
    // A web-first assertion checks the condition repeatedly and continues as
    // soon as it succeeds (or fails with a timeout if it never does).
    await expect(page.getByRole('heading', { name: 'Hello World!' })).toBeVisible();
    await expect(page.locator('#loading')).toBeHidden();
  });

  // This test is skipped, so it will not run as part of the suite. It shows the
  // hard-wait anti-pattern for comparison. Remove .skip only when you want to
  // observe the fixed six-second pause; do not use it to synchronize real tests.
  test.skip('anti-pattern: fixed waitForTimeout() delay', async ({ page }) => {
    await page.goto(DYNAMIC_HIDDEN);
    await page.getByRole('button', { name: 'Start' }).click();
    await page.waitForTimeout(6_000);
    await expect(page.locator('#finish')).toContainText('Hello World!');
  });
});
