import { describe, expect, it } from 'vitest';
import { load as loadPicker } from '../../src/routes/(picker)/+layout';
import { load as loadPinned } from '../../src/routes/(pinned)/+layout';

describe('route-mode layout redirects', () => {
  it('keeps pinned routes when HONCHO_WORKSPACE_ID is configured', async () => {
    const result = await loadPinned({
      parent: async () => ({ runtimeConfig: { workspaceId: 'ws-alpha', version: 'test' } }),
    } as never);

    expect(result).toEqual({ workspaceId: 'ws-alpha' });
  });

  it('redirects stale pinned URLs when deployed in picker mode', async () => {
    await expect(
      loadPinned({
        parent: async () => ({ runtimeConfig: { workspaceId: null, version: 'test' } }),
      } as never),
    ).rejects.toMatchObject({ status: 307, location: '/workspaces' });
  });

  it('keeps picker routes when HONCHO_WORKSPACE_ID is not configured', async () => {
    const result = await loadPicker({
      parent: async () => ({ runtimeConfig: { workspaceId: null, version: 'test' } }),
    } as never);

    expect(result).toEqual({});
  });

  it('redirects stale picker URLs when deployed in pinned mode', async () => {
    await expect(
      loadPicker({
        parent: async () => ({ runtimeConfig: { workspaceId: 'ws-alpha', version: 'test' } }),
      } as never),
    ).rejects.toMatchObject({ status: 307, location: '/peers' });
  });
});
