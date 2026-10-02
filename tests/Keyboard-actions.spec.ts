import { test, expect } from '@playwright/test';

test('user can log in using only the keyboard', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');

  await page.getByPlaceholder('Username').focus();
  await page.keyboard.type('standard_user');
  await page.keyboard.press('Tab');
  await page.keyboard.type('secret_sauce');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.title')).toHaveText('Products');
});