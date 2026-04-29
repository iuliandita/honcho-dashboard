import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ChatPanel from './ChatPanel.svelte';

vi.mock('@tanstack/svelte-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/svelte-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

function doneResponse(): Response {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(enc.encode('data: {"type":"done"}\n\n'));
        controller.close();
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream' } },
  );
}

function errorResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'dialectic denied',
      status: 422,
      traceId: 'trace-chat',
      upstream: 'honcho',
      detail: 'query rejected',
    }),
    { status: 422, headers: { 'Content-Type': 'application/json' } },
  );
}

describe('<ChatPanel>', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Enter submits the current query', async () => {
    const fetchMock = vi.fn(async () => doneResponse());
    vi.stubGlobal('fetch', fetchMock);
    const { getByPlaceholderText } = render(ChatPanel, { props: { workspaceId: 'ws', peerId: 'p' } });
    const input = getByPlaceholderText('ask about this peer');

    await fireEvent.input(input, { target: { value: 'hello' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  });

  it('exposes an explicit label for the query input', () => {
    const fetchMock = vi.fn(async () => doneResponse());
    vi.stubGlobal('fetch', fetchMock);
    const { getByLabelText } = render(ChatPanel, { props: { workspaceId: 'ws', peerId: 'p' } });

    expect(getByLabelText('ask honcho about this peer')).toBeTruthy();
  });

  it('Shift+Enter does not submit', async () => {
    const fetchMock = vi.fn(async () => doneResponse());
    vi.stubGlobal('fetch', fetchMock);
    const { getByPlaceholderText } = render(ChatPanel, { props: { workspaceId: 'ws', peerId: 'p' } });
    const input = getByPlaceholderText('ask about this peer');

    await fireEvent.input(input, { target: { value: 'hello' } });
    await fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ignores another submit while streaming', async () => {
    let finish = () => undefined;
    const fetchMock = vi.fn(async () => {
      const enc = new TextEncoder();
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            finish = () => {
              controller.enqueue(enc.encode('data: {"type":"done"}\n\n'));
              controller.close();
            };
          },
        }),
        { headers: { 'Content-Type': 'text/event-stream' } },
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const { getByPlaceholderText } = render(ChatPanel, { props: { workspaceId: 'ws', peerId: 'p' } });
    const input = getByPlaceholderText('ask about this peer');

    await fireEvent.input(input, { target: { value: 'hello' } });
    await fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(fetchMock).toHaveBeenCalledOnce();
    finish();
  });

  it('can retry the last failed query without retyping it', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(errorResponse()).mockResolvedValueOnce(doneResponse());
    vi.stubGlobal('fetch', fetchMock);
    const { getByPlaceholderText, getByRole, getByText } = render(ChatPanel, {
      props: { workspaceId: 'ws', peerId: 'p' },
    });
    const input = getByPlaceholderText('ask about this peer');

    await fireEvent.input(input, { target: { value: 'force 4xx' } });
    await fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(getByText('dialectic denied')).toBeTruthy());

    await fireEvent.click(getByRole('button', { name: 'retry' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const retryCall = fetchMock.mock.calls[1];
    if (!retryCall) throw new Error('expected retry request');
    const retryInit = retryCall[1] as RequestInit;
    expect(String(retryInit.body)).toContain('force 4xx');
  });
});
