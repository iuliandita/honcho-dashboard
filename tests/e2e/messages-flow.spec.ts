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

    const log = page.getByRole('log');
    await log.evaluate((el) => {
      el.scrollTo({ top: el.scrollHeight });
    });
    await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);

    const page2 = page.waitForResponse(
      (res) => res.url().includes('/messages/list') && res.url().includes('page=2') && res.status() === 200,
    );
    await log.evaluate((el) => {
      el.scrollTo({ top: 0 });
    });
    await page2;

    await expect(page.getByText('message body 50').first()).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('message body 99').first()).toBeVisible();
  });

  test('runtime config remains available from the messages route', async ({ page, request }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/sessions/sess-1`);
    await expect(page.getByText('message body 0').first()).toBeVisible();

    const res = await request.get(`${dashboard.url}/api/runtime-config`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ workspaceId: 'ws-alpha', version: '0.1.0-test' });
  });
});
