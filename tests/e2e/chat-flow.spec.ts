import { expect, test } from '@playwright/test';
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

  test('renders empty state initially', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/chat`);
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
});
