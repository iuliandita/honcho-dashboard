import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('search flow', () => {
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

  test('shows empty state initially', async ({ page }) => {
    await page.goto(`${dashboard.url}/search`);
    await expect(page.getByText('type to search')).toBeVisible();
  });

  test('typing fires debounced query and renders results', async ({ page }) => {
    await page.goto(`${dashboard.url}/search`);

    await page.getByPlaceholder('search this workspace...').fill('coffee');

    await expect(page.getByText('prefers oat milk in coffee')).toBeVisible({ timeout: 2000 });
    await expect(page.getByText('drinks coffee mostly in the morning')).toBeVisible();
    await expect(page.getByRole('button', { name: /coffee/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /work/ })).toBeVisible();
  });

  test('selecting a topic filters results and updates URL', async ({ page }) => {
    await page.goto(`${dashboard.url}/search`);
    await page.getByPlaceholder('search this workspace...').fill('coffee');
    await expect(page.getByText('prefers oat milk in coffee')).toBeVisible({ timeout: 2000 });

    await page.getByRole('button', { name: /work/ }).click();

    await expect(page.getByText('prefers oat milk in coffee')).toHaveCount(0);
    await expect(page.getByText('coffee chats cover remote work, async-first communication')).toBeVisible();
    await expect(page).toHaveURL(/[?&]topic=work/);
  });

  test('deep-linked URL pre-fills query and topic', async ({ page }) => {
    await page.goto(`${dashboard.url}/search?q=coffee&topic=coffee`);

    await expect(page.getByText('prefers oat milk in coffee')).toBeVisible();
    await expect(page.getByPlaceholder('search this workspace...')).toHaveValue('coffee');
  });

  test('escape clears the query', async ({ page }) => {
    await page.goto(`${dashboard.url}/search?q=coffee`);
    await expect(page.getByText('prefers oat milk in coffee')).toBeVisible();

    await page.getByPlaceholder('search this workspace...').press('Escape');
    await expect(page.getByText('type to search')).toBeVisible();
  });
});
