import { test, expect } from '@playwright/test';

test('user can log in and add a product to the cart', async ({ page }) => {
  // Every browser operation is awaited. Playwright auto-waits for elements
  // to become actionable, so explicit sleeps are usually unnecessary.
  await page.goto('https://www.saucedemo.com');

  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/inventory/);
  await expect(page.getByText('Products')).toBeVisible();

  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

  await page.locator('.shopping_cart_link').click();
  await expect(page.getByText('Your Cart')).toBeVisible();
});
