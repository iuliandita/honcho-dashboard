import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import MessageBubble from './MessageBubble.svelte';

const base = {
  id: 'm1',
  content: 'hello world',
  peer_id: 'peer-1',
  session_id: 'sess-1',
  workspace_id: 'ws-1',
  metadata: {},
  created_at: '2026-04-28T12:00:00Z',
  token_count: 2,
};

describe('<MessageBubble>', () => {
  it('renders content', () => {
    const { container } = render(MessageBubble, {
      props: { message: base, peerId: 'peer-1' },
    });
    expect(container.textContent).toContain('hello world');
  });

  it('infers user role from the selected peer id', () => {
    const { container } = render(MessageBubble, {
      props: { message: base, peerId: 'peer-1' },
    });
    expect(container.textContent).toMatch(/user/i);
  });

  it('infers assistant role for other peer ids', () => {
    const { container } = render(MessageBubble, {
      props: { message: { ...base, peer_id: 'peer-2' }, peerId: 'peer-1' },
    });
    expect(container.textContent).toMatch(/assistant/i);
  });

  it('applies a data-role attribute for CSS targeting', () => {
    const { container } = render(MessageBubble, {
      props: { message: base, peerId: 'peer-1' },
    });
    const article = container.querySelector('article');
    expect(article?.getAttribute('data-role')).toBe('user');
  });

  it('renders absolute timestamp', () => {
    const { container } = render(MessageBubble, {
      props: { message: base, peerId: 'peer-1' },
    });
    expect(container.textContent).toContain('2026-04-28 12:00:00');
  });
});
