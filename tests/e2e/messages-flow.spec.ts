import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('messages flow', () => {
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

  test('drills into session and renders first page', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/sessions/sess-1`);

    await expect(page.getByText('message body 0').first()).toBeVisible();
    await expect(page.getByText('message body 49').first()).toBeVisible();

    const m50 = page.getByText('message body 50', { exact: false });
    expect(await m50.count()).toBe(0);
  });

  test('scroll to top loads next page', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/sessions/sess-1`);
    await expect(page.getByText('message body 0').first()).toBeVisible();

    await page.evaluate(() => {
      const list = document.querySelector('[role="log"]');
      if (!list) return;
      const el = list as HTMLElement;
      el.scrollTop = el.scrollHeight;
      el.dispatchEvent(new Event('scroll'));
      el.scrollTop = 0;
      el.dispatchEvent(new Event('scroll'));
    });

    await expect(page.getByText('message body 50').first()).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('message body 99').first()).toBeVisible();
  });

  test('runtime config remains available from the messages route', async ({ page, request }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/sessions/sess-1`);
    await expect(page.getByText('message body 0').first()).toBeVisible();

    const res = await request.get(`${dashboard.url}/api/runtime-config`);
    expect(res.status()).toBe(200);
  });
});
