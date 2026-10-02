import { test, expect } from '@playwright/test';

test('perform common mouse actions on a local demo page', async ({ page }) => {
  // A local fixture keeps mouse-action examples independent of a live website.
  await page.setContent(`
    <style>
      #hover-message { display: none; }
      #hover-card:hover #hover-message { display: block; }
    </style>
    <div id="hover-card"><span>Hover here</span><p id="hover-message">Hover revealed content</p></div>
    <button id="right-click">Right click</button><p id="right-result"></p>
    <button id="double-click">Double click</button><p id="double-result"></p>
    <a id="modifier-link" href="#details">Open details</a><p id="modifier-result"></p>
    <div id="drag-source" draggable="true">Drag me</div>
    <div id="drop-target">Drop here</div><p id="drop-result"></p>
    <script>
      document.querySelector('#right-click').addEventListener('contextmenu', event => {
        event.preventDefault(); document.querySelector('#right-result').textContent = 'Right click received';
      });
      document.querySelector('#double-click').addEventListener('dblclick', () => {
        document.querySelector('#double-result').textContent = 'Double click received';
      });
      document.querySelector('#modifier-link').addEventListener('click', event => {
        document.querySelector('#modifier-result').textContent = event.ctrlKey ? 'Control held' : 'No modifier';
      });
      document.querySelector('#drag-source').addEventListener('dragstart', event => {
        event.dataTransfer.setData('text/plain', 'dragged');
      });
      document.querySelector('#drop-target').addEventListener('dragover', event => event.preventDefault());
      document.querySelector('#drop-target').addEventListener('drop', event => {
        event.preventDefault(); document.querySelector('#drop-result').textContent = 'Dropped successfully';
      });
    </script>
  `);

  // Hover can reveal menus, captions, or tooltips.
  await page.locator('#hover-card').hover();
  await expect(page.getByText('Hover revealed content')).toBeVisible();

  // A right click sends the browser's contextmenu event.
  await page.locator('#right-click').click({ button: 'right' });
  await expect(page.locator('#right-result')).toHaveText('Right click received');

  // Double click sends a dblclick event to the target.
  await page.locator('#double-click').dblclick();
  await expect(page.locator('#double-result')).toHaveText('Double click received');

  // Modifiers can be held while clicking, for example Control-click.
  await page.locator('#modifier-link').click({ modifiers: ['Control'] });
  await expect(page.locator('#modifier-result')).toHaveText('Control held');

  // dragTo() moves one locator onto another locator and performs the drop.
  await page.locator('#drag-source').dragTo(page.locator('#drop-target'));
  await expect(page.locator('#drop-result')).toHaveText('Dropped successfully');
});
