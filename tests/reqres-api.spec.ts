import { test, expect } from '@playwright/test';

const apiKey = process.env.REQRES_API_KEY;

test('fetch the ReqRes sample products collection', async ({ request }) => {
  // ReqRes requires an API key. Keep the key out of source control and set
  // REQRES_API_KEY in the terminal or CI environment before running this test.
  test.skip(!apiKey, 'Set REQRES_API_KEY to run ReqRes API examples.');

  const response = await request.get('https://reqres.in/api/collections/products/records', {
    headers: {
      'x-api-key': apiKey!,
      'X-Reqres-Env': 'prod',
    },
  });

  // Check the HTTP result first, then inspect the JSON body returned by the API.
  expect(response.ok()).toBeTruthy();
  const body: unknown = await response.json();
  expect(body).toBeTruthy();
});
