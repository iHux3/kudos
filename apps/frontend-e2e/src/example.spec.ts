import { test, expect } from '@playwright/test';

test('creates kudos and shows it in feed', async ({ page }) => {
  const receiverId = crypto.randomUUID();
  const message = `e2e kudos ${Date.now()}`;

  const feedResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/kudos?limit=20&offset=0') &&
      response.request().method() === 'GET'
  );

  await page.goto('/');
  await feedResponsePromise;

  const feed = page.locator('section[aria-label="Recent kudos feed"]');
  await expect(feed).toBeVisible();
  await expect(feed).not.toContainText('Error:');

  const form = page.locator('section[aria-label="Send kudos"]');
  await form.getByPlaceholder('receiver UUID').fill(receiverId);
  await form.locator('select').selectOption('Teamwork');
  await form.getByPlaceholder('Napis, za co dekujes...').fill(message);

  const createResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/kudos') &&
      response.request().method() === 'POST' &&
      response.status() === 201
  );

  await form.getByRole('button', { name: 'Send kudos' }).click();
  await createResponsePromise;

  const newestItem = feed.locator('li').first();
  await expect(newestItem).toContainText(message);
  await expect(newestItem).toContainText(`To: ${receiverId}`);

  await expect(form.getByPlaceholder('receiver UUID')).toHaveValue('');
  await expect(form.getByPlaceholder('Napis, za co dekujes...')).toHaveValue('');
});
