import { test, expect } from '@playwright/test';

test('open one new tab', async ({ page }) => {
    await page.goto('https://demoqa.com/browser-windows');

    // 1. start watching for a new tab
    const newTabPromise = page.context().waitForEvent('page');

    // 2. click the button that opens it
    await page.locator('#tabButton').click();

    // 3. get the new tab
    const newTab = await newTabPromise;

    // 4. check the text inside the new tab
    await expect(newTab.locator('#sampleHeading')).toHaveText('This is a sample page');

        // 5. close the new tab (tab 2)
    await newTab.close();

    // 6. tab 1 (page) should still work: the button is still there
    await expect(page.locator('#tabButton')).toBeVisible();
});

test('open two new tabs', async ({ page }) => {
    await page.goto('https://demoqa.com/browser-windows');

    // ---- first new tab ----
    const tab2Promise = page.context().waitForEvent('page');   // watch
    await page.locator('#tabButton').click();                  // click
    const tab2 = await tab2Promise;                            // get it

    // ---- second new tab ----
    const tab3Promise = page.context().waitForEvent('page');   // watch again
    await page.locator('#tabButton').click();                  // click again
    const tab3 = await tab3Promise;                            // get it

    // 3 tabs are open now: page, tab2, tab3
    expect(page.context().pages()).toHaveLength(3);

    // check the text in both new tabs
    await expect(tab2.locator('#sampleHeading')).toHaveText('This is a sample page');
    await expect(tab3.locator('#sampleHeading')).toHaveText('This is a sample page');

    // close tab2, then check that tab3 still works
    await tab2.close();
    expect(page.context().pages()).toHaveLength(2);
    await expect(tab3.locator('#sampleHeading')).toBeVisible();
});