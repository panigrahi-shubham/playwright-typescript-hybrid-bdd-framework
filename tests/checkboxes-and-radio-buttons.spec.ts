import { test, expect } from '@playwright/test';

test('check and uncheck checkboxes, then inspect their state', async ({ page }) => {
  // Labels provide accessible names, so tests can avoid brittle CSS selectors.
  await page.setContent(`
    <label><input type="checkbox" id="newsletter" /> Subscribe to newsletter</label>
    <label><input type="checkbox" id="terms" checked /> Accept terms</label>
  `);

  const newsletter = page.getByRole('checkbox', { name: 'Subscribe to newsletter' });
  const terms = page.getByRole('checkbox', { name: 'Accept terms' });

  // isChecked() reads the current state. check() is safe to call when unchecked.
  expect(await newsletter.isChecked()).toBe(false);
  await newsletter.check();
  await expect(newsletter).toBeChecked();

  // uncheck() leaves an already-unchecked checkbox unchanged, then verify state.
  await terms.uncheck();
  await expect(terms).not.toBeChecked();
});

test('select a radio option by label or role', async ({ page }) => {
  await page.setContent(`
    <fieldset>
      <legend>Choose an answer</legend>
      <label><input type="radio" name="answer" value="yes" /> Yes</label>
      <label><input type="radio" name="answer" value="impressive" /> Impressive</label>
      <p id="selected-answer"></p>
    </fieldset>
    <script>
      document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.addEventListener('change', () => {
          document.querySelector('#selected-answer').textContent = radio.value;
        });
      });
    </script>
  `);

  // Radio buttons in one group are mutually exclusive. Select with an
  // accessible label, then with an explicit role and accessible name.
  const yes = page.getByLabel('Yes');
  const impressive = page.getByRole('radio', { name: 'Impressive' });

  await yes.check();
  await expect(yes).toBeChecked();

  await impressive.check();
  await expect(impressive).toBeChecked();
  await expect(yes).not.toBeChecked();
  await expect(page.locator('#selected-answer')).toHaveText('impressive');
});
