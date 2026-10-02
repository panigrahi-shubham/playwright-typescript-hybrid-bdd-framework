import { test, expect } from '@playwright/test';

test('select options in native single and multi-select dropdowns', async ({ page }) => {
  // selectOption() works only with real HTML <select> elements.
  await page.setContent(`
    <label for="single">Single select</label>
    <select id="single">
      <option value="">Choose an option</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    </select>

    <label for="multi">Multi-select</label>
    <select id="multi" multiple>
      <option value="option1">Option A</option>
      <option value="option2">Option B</option>
      <option value="option3">Option C</option>
    </select>
  `);

  const singleSelect = page.locator('#single');

  // Select by the visible label, then verify the option's underlying value.
  await singleSelect.selectOption({ label: 'Option 1' });
  await expect(singleSelect).toHaveValue('1');

  // A string selects by value. Here the value is "2", while its label is "Option 2".
  await singleSelect.selectOption('2');
  await expect(singleSelect).toHaveValue('2');

  // index is zero-based across all options, including the placeholder at index 0.
  await singleSelect.selectOption({ index: 1 });
  await expect(singleSelect).toHaveValue('1');
  await expect(page.locator('#single option:checked')).toHaveText('Option 1');

  // A <select multiple> accepts an array of values or label objects.
  const multiSelect = page.locator('#multi');
  await multiSelect.selectOption(['option1', 'option3']);
  await expect(multiSelect).toHaveValues(['option1', 'option3']);
  await multiSelect.selectOption([{ label: 'Option A' }, { label: 'Option B' }]);
  await expect(multiSelect).toHaveValues(['option1', 'option2']);
});

test('choose an option from a custom dropdown', async ({ page }) => {
  // This control is made from a button and list items, not a <select> element.
  // selectOption() would fail here; interact with it like a regular menu.
  await page.setContent(`
    <button id="product-picker" aria-haspopup="listbox" aria-expanded="false">Choose a product</button>
    <ul id="product-options" role="listbox" aria-label="Products" hidden>
      <li role="option" aria-selected="false">Group 1, option 1</li>
      <li role="option" aria-selected="false">Group 1, option 2</li>
    </ul>
    <script>
      const picker = document.querySelector('#product-picker');
      const options = document.querySelector('#product-options');
      picker.addEventListener('click', () => {
        options.hidden = false;
        picker.setAttribute('aria-expanded', 'true');
      });
      options.addEventListener('click', event => {
        if (event.target.getAttribute('role') === 'option') {
          picker.textContent = event.target.textContent;
          picker.setAttribute('aria-expanded', 'false');
          options.hidden = true;
        }
      });
    </script>
  `);

  await page.getByRole('button', { name: 'Choose a product' }).click();
  await page.getByRole('option', { name: 'Group 1, option 1' }).click();

  // Verify the choice is reflected on the dropdown button.
  await expect(page.getByRole('button', { name: 'Group 1, option 1' })).toHaveAttribute('aria-expanded', 'false');
});
