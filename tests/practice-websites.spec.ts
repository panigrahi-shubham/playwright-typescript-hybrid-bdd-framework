import { test, expect } from '@playwright/test';

test('add and complete todos in the Playwright TodoMVC demo', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');

  // Add each todo by filling the accessible placeholder and pressing Enter.
  const newTodo = page.getByPlaceholder('What needs to be done?');
  await newTodo.fill('Write Playwright tests');
  await newTodo.press('Enter');
  await newTodo.fill('Learn XPath');
  await newTodo.press('Enter');
  await newTodo.fill('Practice CSS selectors');
  await newTodo.press('Enter');

  // Check the list and complete only the first todo.
  const todos = page.getByRole('listitem');
  await expect(todos).toHaveCount(3);
  await todos.first().getByRole('checkbox').check();

  // Filter to completed items and verify just the completed todo is shown.
  await page.getByRole('link', { name: 'Completed' }).click();
  await expect(todos).toHaveCount(1);
  await expect(todos.first()).toContainText('Write Playwright tests');
});

test('accept a JavaScript alert on The Internet', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

  // Register the dialog handler before clicking the button that opens it.
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toBe('I am a JS Alert');
    await dialog.accept();
  });

  await page.getByRole('button', { name: 'Click for JS Alert' }).click();
  await expect(page.locator('#result')).toContainText('successfully clicked');
});

test('type into the TinyMCE editor inside an iframe', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/iframe');

  // frameLocator() switches locator searches into the iframe document.
  const editor = page.frameLocator('#mce_0_ifr').locator('body');
  await editor.fill('Playwright iframe test');
  await expect(editor).toContainText('Playwright iframe test');
});
