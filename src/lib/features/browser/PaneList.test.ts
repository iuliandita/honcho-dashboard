import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PaneList from './PaneList.svelte';

describe('<PaneList>', () => {
  it('renders fallback id text for each item when no row snippet is supplied', () => {
    const { container } = render(PaneList, {
      props: {
        items: [{ id: 'a' }, { id: 'b' }],
        empty: { title: 'no items' },
      },
    });

    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('b');
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
});
