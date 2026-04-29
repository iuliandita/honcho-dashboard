import { fireEvent, render, within } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import PaneList from './PaneList.svelte';

describe('<PaneList>', () => {
  it('renders fallback id text for each item when no row snippet is supplied', () => {
    const { getAllByRole } = render(PaneList, {
      props: {
        items: [{ id: 'a' }, { id: 'b' }],
        empty: { title: 'no items' },
      },
    });
    const rows = getAllByRole('listitem');

    expect(within(rows[0] as HTMLElement).getByText('a')).toBeTruthy();
    expect(within(rows[1] as HTMLElement).getByText('b')).toBeTruthy();
  });

  it('renders navigational rows as links when hrefFor is supplied', () => {
    const { getByRole, queryByRole } = render(PaneList, {
      props: {
        items: [{ id: 'alpha' }],
        selectedId: 'alpha',
        empty: { title: 'items' },
        hrefFor: (item: { id: string }) => `/items/${item.id}`,
      },
    });

    const link = getByRole('link', { name: 'alpha' });
    expect(link.getAttribute('href')).toBe('/items/alpha');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(queryByRole('listbox')).toBeNull();
    expect(queryByRole('option')).toBeNull();
  });

  it('renders empty state when items.length === 0 and not loading', () => {
    const { container } = render(PaneList, {
      props: {
        items: [],
        empty: { title: 'nothing here' },
      },
    });

    expect(container.textContent).toContain('nothing here');
  });

  it('renders loading state when loading=true and items are empty', () => {
    const { container } = render(PaneList, {
      props: {
        items: [],
        empty: { title: 'nothing' },
        loading: true,
      },
    });

    expect(container.querySelector('[role="status"]')?.textContent).toMatch(/loading/i);
  });

  it('renders error pane when error is set', () => {
    const { container } = render(PaneList, {
      props: {
        items: [],
        empty: { title: 'nothing' },
        error: { message: 'broken' },
      },
    });

    expect(container.textContent).toContain('broken');
  });

  it('shows error recovery details and retries when requested', async () => {
    const onRetry = vi.fn();
    const { getByRole, getByText } = render(PaneList, {
      props: {
        items: [],
        empty: { title: 'peers' },
        error: { message: 'backend unavailable', status: 503, traceId: 'trace-123', upstream: 'honcho' },
        onRetry,
      },
    });

    expect(getByText('backend unavailable')).toBeTruthy();
    expect(getByText('peers')).toBeTruthy();
    expect(getByText('503')).toBeTruthy();
    expect(getByText('trace-123')).toBeTruthy();

    await fireEvent.click(getByRole('button', { name: 'retry' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('activates callback rows as native buttons', async () => {
    const onSelect = vi.fn();
    const { getByRole } = render(PaneList, {
      props: {
        items: [{ id: 'alpha' }],
        empty: { title: 'items' },
        onSelect,
      },
    });
    const row = getByRole('button', { name: 'alpha' });

    await fireEvent.click(row);

    expect(onSelect).toHaveBeenNthCalledWith(1, { id: 'alpha' });
  });
});
