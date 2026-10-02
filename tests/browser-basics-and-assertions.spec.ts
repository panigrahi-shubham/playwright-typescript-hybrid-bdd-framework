import { test, expect } from '@playwright/test';

test('inspect and reload the Sauce Demo page', async ({ page }) => {
  // The page fixture launches the browser configured for this project and
  // closes it after the test. Use --project=chromium/firefox/webkit to choose it.
  await page.goto('https://www.saucedemo.com');

  // page.title() and page.url() return the current page information.
  expect(await page.title()).toBe('Swag Labs');
  expect(page.url()).toContain('saucedemo.com');

  // Reload the current page, then use web-first assertions that retry until
  // the expected state appears.
  await page.reload();
  await expect(page).toHaveTitle('Swag Labs');
  await expect(page).toHaveURL(/saucedemo\.com/);
  await expect(page.getByPlaceholder('Username')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
  await expect(page.locator('.login_logo')).toHaveText('Swag Labs');

  // A negative assertion checks that an error message is not visible before
  // attempting an invalid login. Hidden or absent elements both satisfy it.
  await expect(page.locator('[data-test="error"]')).not.toBeVisible();
});

test('verify page and inventory assertions after login', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // Assert the navigation outcome, a visible heading, and the expected number
  // of products. Each assertion waits for the page to reach the expected state.
  await expect(page).toHaveURL(/inventory/);
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  await expect(page.locator('.inventory_item')).toHaveCount(6);
});
