# Your First Playwright Test and Locators

The examples in this guide are in `tests/login.spec.ts`,
`tests/locator-strategies.spec.ts`, and `tests/locator-scoping.spec.ts`.

## Anatomy of a test

```ts
import { test, expect } from '@playwright/test';

test('describes an outcome', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.getByPlaceholder('Username').fill('standard_user');
  await expect(page).toHaveURL(/inventory/);
});
```

- `test()` defines a test case, and Playwright provides its `page` fixture.
- Test callbacks are `async`; await navigation, actions, and assertions.
- `expect()` checks the result and fails the test when it does not match.
- Locators and web assertions retry while waiting for the page to reach the
  expected state. Prefer those waits over fixed sleeps such as `waitForTimeout()`.

## Locator choice

Start with locators that describe how a person or assistive technology identifies
the control. A useful order is `getByRole()`, `getByLabel()`,
`getByPlaceholder()`, `getByText()`, then `getByTestId()`, `getByAltText()`,
or `getByTitle()`. Use `locator()` with CSS or XPath when the semantic options
do not describe the element well.

| Locator | Good for | Example |
| --- | --- | --- |
| `getByRole()` | Buttons, links, headings, textboxes, checkboxes, dialogs | `page.getByRole('button', { name: 'Login' })` |
| `getByLabel()` | Inputs associated with a `<label>` or accessible name | `page.getByLabel('Email address')` |
| `getByPlaceholder()` | Inputs identified by placeholder text | `page.getByPlaceholder('Username')` |
| `getByText()` | Visible content; exact matching is optional | `page.getByText('Your Cart', { exact: true })` |
| `getByTestId()` | Stable team-owned `data-testid` hooks | `page.getByTestId('save-button')` |
| `getByAltText()` | Images and image controls with useful alt text | `page.getByAltText('Company logo')` |
| `getByTitle()` | Elements with a descriptive `title` tooltip | `page.getByTitle('Close dialog')` |
| `locator()` | CSS or XPath fallback | `page.locator('.shopping_cart_badge')` |

Role locators target accessible roles and names such as `button`, `link`,
`textbox`, `checkbox`, `radio`, `combobox`, `heading`, `dialog`, `alert`,
`list`, and `listitem`. They check the user-facing accessibility contract and
usually withstand style and layout changes. If a field has no label, try an
accessible role/name or its placeholder. For an application you control, add a
test ID when the user-facing semantics are not unique or stable. A custom test
ID attribute can be configured with `use.testIdAttribute` in
`playwright.config.ts`.

Playwright evaluates locators against the current page when they are used,
instead of holding a cached DOM element. Actions wait for the target to be
visible, stable, enabled, and able to receive events. Prefer locators over the
legacy `page.$()` and `page.$$()` ElementHandle methods.

## Scoping and matching lists

Use `filter({ hasText })` or `filter({ has })` to identify a container by its
content, then locate a child inside it. `first()`, `last()`, and `nth(index)`
select a match (`nth()` is zero-based); use these only when order is meaningful.
`toHaveCount()` can assert how many elements match. See
`tests/locator-scoping.spec.ts` for product-card and table-row examples.

## Run and debug

```bash
npx playwright test                              # all tests
npx playwright test tests/login.spec.ts
npx playwright test tests/login.spec.ts --project=chromium
npx playwright test tests/login.spec.ts --project=firefox
npx playwright test --headed                     # show the browser
npx playwright test --ui                         # interactive UI mode
npx playwright show-report                       # open the HTML report
```

UI Mode shows the test tree, browser view, and step timeline. Select a step to
inspect the page snapshot for that point in the run.

## Browser and page basics

The configured `chromium`, `firefox`, and `webkit` projects choose which browser
the `page` fixture uses. The fixture also creates and closes the browser context
and page for each test. Use a manual launch only for experiments that need a
separate browser lifecycle:

```ts
import { test, chromium } from '@playwright/test';

test('launch a browser manually for an experiment', async () => {
  const browser = await chromium.launch({ headless: false });
  try {
    const page = await browser.newPage();
    await page.goto('https://www.saucedemo.com');
    console.log(await page.title(), page.url());
  } finally {
    await browser.close();
  }
});
```

Useful page methods include `goto()`, `title()`, `url()`, `reload()`,
`goBack()`, `goForward()`, `screenshot()`, `locator()`, `getByRole()`,
`waitForURL()`, and `waitForLoadState()`. Prefer assertions such as
`toHaveTitle()`, `toHaveURL()`, `toBeVisible()`, `toBeEnabled()`,
`toHaveText()`, `toHaveValue()`, and `toHaveCount()` to verify the outcome of
meaningful actions. These web-first assertions retry while waiting for the
expected state. Examples are in `tests/browser-basics-and-assertions.spec.ts`.
