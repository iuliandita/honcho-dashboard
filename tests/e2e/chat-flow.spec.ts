import { type Page, expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('chat flow', () => {
  let stub: Awaited<ReturnType<typeof startStubHoncho>>;
  let dashboard: Awaited<ReturnType<typeof startDashboard>>;

  test.beforeAll(async () => {
    stub = await startStubHoncho();
    dashboard = await startDashboard({ apiBase: stub.url, workspaceId: 'ws-alpha' });
  });

  test.afterAll(async () => {
    await dashboard?.stop();
    await stub?.stop();
  });

  async function ask(page: Page, query: string) {
    const input = page.getByPlaceholder('ask about this peer');
    await input.fill(query);
    await page.getByRole('button', { name: 'send' }).click();
  }

  test('renders empty state initially', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/chat`);
    await expect(page.getByRole('heading', { name: 'chat' })).toBeVisible();
    await expect(page.getByText('peer peer-1')).toBeVisible();
    await expect(page.getByText('ask honcho about this peer')).toBeVisible();
    await expect(page.getByPlaceholder('ask about this peer')).toBeVisible();
  });

  test('SSE round trip — input then stream then final state', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/chat`);

    const input = page.getByPlaceholder('ask about this peer');
    await input.fill('what does this peer like?');

    await page.getByRole('button', { name: 'send' }).click();

    // Final response assembled
    await expect(page.getByText('this peer likes oat milk.')).toBeVisible({ timeout: 5000 });

    // Streaming indicator gone, "done" stat shown
    await expect(page.getByText(/\d+ chars/)).toBeVisible();
    await expect(page.getByText('streaming…')).toHaveCount(0);
  });

  test('input clears after submit', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/chat`);

    const input = page.getByPlaceholder('ask about this peer');
    await input.fill('hello');
    await page.getByRole('button', { name: 'send' }).click();

    await expect(input).toHaveValue('');
  });

  test('renders 4xx chat errors from Honcho detail bodies', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/chat`);

    await ask(page, 'force 4xx');

    await expect(page.getByText('chat failed')).toBeVisible();
    await expect(page.getByText('422')).toBeVisible();
    await expect(page.getByText('dialectic denied')).toBeVisible();
    await expect(page.getByText('trace')).toBeVisible();
  });

  test('renders partial output and error state when the stream fails mid-flight', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/chat`);

    await ask(page, 'midstream 5xx');

    await expect(page.getByText('partial before failure')).toBeVisible();
    await expect(page.getByText('chat failed')).toBeVisible();
    await expect(page.locator('code').filter({ hasText: /^0$/ })).toBeVisible();
  });

  test('skips malformed SSE frames and keeps valid events', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/chat`);

    await ask(page, 'malformed sse');

    await expect(page.getByText('clean token after malformed')).toBeVisible();
    await expect(page.getByText(/\d+ chars/)).toBeVisible();
  });

  test('decodes multi-byte UTF-8 split across stream chunks', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/chat`);

    await ask(page, 'split utf8');

    await expect(page.getByText('cafe ☕')).toBeVisible();
    await expect(page.getByText(/\d+ chars/)).toBeVisible();
  });

  test('ignores tokens that arrive after done in the same chunk', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/chat`);

    await ask(page, 'done then trailing');

    await expect(page.getByText('finished cleanly')).toBeVisible();
    await expect(page.getByText('should not render')).toHaveCount(0);
  });
});
