# Playwright Best Practices

## Write reliable tests

1. **Await every browser action.** Use `await` for navigation, clicks, fills,
   keyboard input, and checks so each step completes before the next begins.
2. **Prefer semantic locators.** Try role, label, placeholder, and visible text
   locators before CSS or XPath. Use a team-owned `data-testid` when a control
   has no stable user-facing name.
3. **Avoid hard sleeps.** Do not use `page.waitForTimeout()` to synchronize a
   test. Actions auto-wait for actionability, and web assertions retry until
   their expected condition is met or times out.
4. **Keep tests independent.** Each test should create its own starting state
   and work regardless of test order. Use hooks or fixtures for reusable setup.
5. **Use stable selectors.** Avoid generated or minified CSS classes. CSS and
   XPath examples are in `tests/xpath-css-selectors.spec.ts`.

## Handle authentication and debugging

- For repeated authenticated flows, save browser storage state after logging
  in, then load it in the relevant project or test setup. Treat the state file
  as a credential and keep it out of source control.
- Run headed locally when you want to see the browser. CI usually runs headless.
- For failures, use `npx playwright test --trace on` and open the resulting
  trace with `npx playwright show-trace <trace.zip>`. Traces include a timeline
  and page snapshots that help explain what happened at each step.
- Playwright UI Mode (`npx playwright test --ui`) and Inspector (`--debug`) are
  useful for stepping through a test and inspecting locators.

## Grow the test structure gradually

When several tests repeat the same page interactions, move those locators and
actions into a Page Object Model class. Keep assertions about the user-visible
outcome in the tests where practical, so the test intent remains easy to read.

## Run the examples

```bash
npx playwright test tests/xpath-css-selectors.spec.ts --project=chromium
npx playwright test tests/practice-websites.spec.ts --project=chromium
npx playwright test tests/reqres-api.spec.ts
```

The ReqRes example is skipped unless `REQRES_API_KEY` is set in the environment.
The current ReqRes service requires an `x-api-key` request header; see the
[ReqRes API docs](https://reqres.in/docs) for account and key setup.
