import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

// Read external test data so credentials and expected outcomes can be updated
// without editing the test flow itself.
const loginDataPath = path.resolve(__dirname, '../test-data/login-users.json');
const loginData = JSON.parse(readFileSync(loginDataPath, 'utf8')) as {
  users: Array<{
    username: string;
    password: string;
    expectedResult: 'success' | 'locked out';
  }>;
};

// Each record becomes an independent Playwright test with its own page fixture.
for (const user of loginData.users) {
  test(`login with ${user.username}`, async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.getByPlaceholder('Username').fill(user.username);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();

    if (user.expectedResult === 'success') {
      // Successful users reach the products inventory page.
      await expect(page).toHaveURL(/inventory/);
      await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    } else {
      // A locked account stays on login and shows an explanatory error message.
      await expect(page.locator('[data-test="error"]')).toContainText(user.expectedResult);
      await expect(page).not.toHaveURL(/inventory/);
    }
  });
}
