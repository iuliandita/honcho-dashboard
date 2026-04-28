import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import MessageBubble from './MessageBubble.svelte';

const base = {
  id: 'm1',
  content: 'hello world',
  createdAt: '2026-04-28T12:00:00Z',
};

describe('<MessageBubble>', () => {
  it('renders content', () => {
    const { container } = render(MessageBubble, {
      props: { message: { ...base, role: 'user' } },
    });
    expect(container.textContent).toContain('hello world');
  });

  it('renders the canonical role label', () => {
    const { container } = render(MessageBubble, {
      props: { message: { ...base, role: 'ASSISTANT' } },
    });
    expect(container.textContent).toMatch(/assistant/i);
  });

  it('shows role "other" for unknown roles', () => {
    const { container } = render(MessageBubble, {
      props: { message: { ...base, role: 'tool' } },
    });
    expect(container.textContent).toMatch(/other/i);
  });

  it('applies a data-role attribute for CSS targeting', () => {
    const { container } = render(MessageBubble, {
      props: { message: { ...base, role: 'system' } },
    });
    const article = container.querySelector('article');
    expect(article?.getAttribute('data-role')).toBe('system');
  });

  it('renders absolute timestamp', () => {
    const { container } = render(MessageBubble, {
      props: { message: { ...base, role: 'user' } },
    });
    expect(container.textContent).toContain('2026-04-28 12:00:00');
  });
});
