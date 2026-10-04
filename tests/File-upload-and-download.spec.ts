import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const UPLOAD_FILE = path.join(__dirname, '..', 'test-data', 'hello.txt');
const UPLOAD_URL = 'https://demoqa.com/upload-download';

test('upload file via input', async ({ page }) => {
    // Navigate to the upload page and wait until the DOM is ready.
    // This ensures the upload control is present before we interact with it.
    await page.goto(UPLOAD_URL, { waitUntil: 'domcontentloaded' });

    // Use Playwright's setInputFiles to simulate selecting a local file for the input element.
    // This is the simplest upload flow when the element is directly available in the DOM.
    await page.locator('#uploadFile').setInputFiles(UPLOAD_FILE);

    // The browser does not expose the real local file path for security reasons.
    // Instead, it shows a fake path like C:\fakepath\..., so the assertion should
    // validate the visible file name rather than the full OS path.
    await expect(page.locator('#uploadedFilePath')).toContainText('hello.txt');
});

test('upload file via file chooser', async ({ page }) => {
    // Open the upload page and wait for the page content to be available.
    await page.goto(UPLOAD_URL, { waitUntil: 'domcontentloaded' });

    // Set up the file chooser listener BEFORE clicking the trigger.
    // If the click happens first, the browser event may be missed before the listener is attached.
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('#uploadFile').click();
    const fileChooser = await fileChooserPromise;

    // Supply the local file to the file chooser dialog that the browser opened in response to the click.
    await fileChooser.setFiles(UPLOAD_FILE);

    // The UI shows the selected file name after a successful upload interaction.
    await expect(page.locator('#uploadedFilePath')).toContainText('hello.txt');
});

test('download file and verify it', async ({ page }) => {
    // Go to the page that contains both the upload and download controls.
    await page.goto(UPLOAD_URL, { waitUntil: 'domcontentloaded' });

    // Listen for the browser download event BEFORE clicking the download button.
    // This ensures we catch the generated file as soon as the browser starts downloading it.
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#downloadButton').click();
    const download = await downloadPromise;

    // 1. The site advertises a name for the downloaded file.
    //    We verify that expected filename before saving it to disk.
    expect(download.suggestedFilename()).toBe('sampleFile.jpeg');

    // 2. Save the downloaded file into a project-level downloads folder.
    //    This lets us confirm the browser actually downloaded the file and that it is not empty.
    const savePath = path.join(__dirname, '..', 'downloads', download.suggestedFilename());
    await download.saveAs(savePath);

    // Confirm the file exists and has content.
    expect(fs.existsSync(savePath)).toBeTruthy();
    expect(fs.statSync(savePath).size).toBeGreaterThan(0);
});
