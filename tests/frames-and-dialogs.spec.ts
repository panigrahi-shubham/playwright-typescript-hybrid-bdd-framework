import { test, expect } from '@playwright/test';

test('accept a JavaScript alert', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

  // Register the dialog listener before triggering the alert, or the page can
  // pause waiting for a dialog handler that was attached too late.
  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe('I am a JS Alert');
    await dialog.accept();
  });

  await page.getByRole('button', { name: 'Click for JS Alert' }).click();
  await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');
});

test('accept or dismiss a JavaScript confirmation', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

  // Accept chooses OK in the native confirm dialog.
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
  await expect(page.locator('#result')).toHaveText('You clicked: Ok');

  // Dismiss chooses Cancel in the next confirmation dialog.
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
  await expect(page.locator('#result')).toHaveText('You clicked: Cancel');
});

test('enter text into a JavaScript prompt', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

  // Passing a string to accept() supplies the prompt input before clicking OK.
  page.once('dialog', (dialog) => dialog.accept('Playwright is awesome'));
  await page.getByRole('button', { name: 'Click for JS Prompt' }).click();
  await expect(page.locator('#result')).toHaveText('You entered: Playwright is awesome');
});

test('fill the editor inside an iframe', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/iframe');

  // An iframe has its own document. Use frameLocator() before locating content
  // inside it; page.locator() searches only the outer document.
  const editor = page.frameLocator('#mce_0_ifr').locator('body');
  await editor.fill('This text is inside an iframe');
  await expect(editor).toContainText('This text is inside an iframe');
});
