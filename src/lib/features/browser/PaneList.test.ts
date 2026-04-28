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
    const rows = getAllByRole('option');

    expect(within(rows[0] as HTMLElement).getByText('a')).toBeTruthy();
    expect(within(rows[1] as HTMLElement).getByText('b')).toBeTruthy();
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

  it('activates a focused row with Enter or Space', async () => {
    const onSelect = vi.fn();
    const { getByRole } = render(PaneList, {
      props: {
        items: [{ id: 'alpha' }],
        empty: { title: 'items' },
        onSelect,
      },
    });
    const row = getByRole('option', { name: 'alpha' });

    await fireEvent.keyDown(row, { key: 'Enter' });
    await fireEvent.keyDown(row, { key: ' ' });

    expect(onSelect).toHaveBeenNthCalledWith(1, { id: 'alpha' });
    expect(onSelect).toHaveBeenNthCalledWith(2, { id: 'alpha' });
  });
});
