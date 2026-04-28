import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import TopicChip from './TopicChip.svelte';

describe('<TopicChip>', () => {
  it('renders the topic label and count', () => {
    const { container } = render(TopicChip, {
      props: { topic: 'coffee', selected: false, count: 5, onClick: () => {} },
    });

    expect(container.textContent).toContain('coffee');
    expect(container.textContent).toContain('5');
  });

  it('applies selected class when selected', () => {
    const { container } = render(TopicChip, {
      props: { topic: 'coffee', selected: true, count: 5, onClick: () => {} },
    });

    expect(container.querySelector('button')?.classList.contains('selected')).toBe(true);
  });

  it('fires onClick with the topic name', async () => {
    const handler = vi.fn();
    const { container } = render(TopicChip, {
      props: { topic: 'coffee', selected: false, count: 5, onClick: handler },
    });
    const button = container.querySelector('button');
    if (button) await fireEvent.click(button);

    expect(handler).toHaveBeenCalledWith('coffee');
  });

  it('renders the all-topics chip with count', () => {
    const { container } = render(TopicChip, {
      props: { topic: null, selected: true, count: 12, onClick: () => {} },
    });

    expect(container.textContent).toContain('all');
    expect(container.textContent).toContain('12');
  });
});
