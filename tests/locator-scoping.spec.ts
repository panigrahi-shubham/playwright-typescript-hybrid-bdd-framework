import { test, expect } from '@playwright/test';

test('scope locators to the matching product and use list helpers', async ({ page }) => {
  // Build a small, predictable page for this example. Each product card has
  // the same button, so the test needs to scope the button to the right card.
  await page.setContent(`
    <ul>
      <li class="product-card"><h2>Sauce Labs Backpack</h2><button>Add to cart</button></li>
      <li class="product-card"><h2>Sauce Labs Bike Light</h2><button>Add to cart</button></li>
      <li class="product-card"><h2>Sauce Labs Bolt T-Shirt</h2><button>Add to cart</button></li>
    </ul>
    <table>
      <tr><td>standard_user</td><td>active</td></tr>
      <tr><td>locked_out_user</td><td>inactive</td></tr>
    </table>
  `);

  // This locator represents all three elements whose class is "product-card".
  const cards = page.locator('.product-card');

  // filter({ hasText }) narrows that group to the card containing this product name.
  const backpack = cards.filter({ hasText: 'Sauce Labs Backpack' });

  // Assert there are three cards, then demonstrate list position helpers.
  // first() and last() select the ends of the list; nth() uses a zero-based index,
  // so nth(1) means the second card.
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toContainText('Backpack');
  await expect(cards.last()).toContainText('T-Shirt');
  await expect(cards.nth(1)).toContainText('Bike Light');

  // Search for the button only inside the Backpack card. Without this scope,
  // three identical "Add to cart" buttons would match on the page.
  await backpack.getByRole('button', { name: 'Add to cart' }).click();

  // The fixture button has no cart behavior; this confirms the scoped button
  // locator still finds the visible button after the click.
  await expect(backpack.getByRole('button', { name: 'Add to cart' })).toBeVisible();

  // filter({ has }) narrows table rows to the one containing the standard username.
  // page.getByText(...) is the child locator used to identify that row.
  const standardUserRow = page.locator('tr').filter({ has: page.getByText('standard_user') });

  // Check content within that row to confirm the intended row was selected.
  await expect(standardUserRow).toContainText('active');
});
