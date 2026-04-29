import { fireEvent, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchInput from './SearchInput.svelte';

describe('<SearchInput>', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports input immediately and commits after debounce', async () => {
    const onCommit = vi.fn();
    const onValueChange = vi.fn();
    const { getByPlaceholderText } = render(SearchInput, {
      props: { value: '', onCommit, onValueChange, debounceMs: 200 },
    });

    await fireEvent.input(getByPlaceholderText('search this workspace...'), { target: { value: 'coffee' } });
    expect(onValueChange).toHaveBeenCalledWith('coffee');
    expect(onCommit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(onCommit).toHaveBeenCalledWith('coffee');
  });

  it('uses a purpose label and separates shortcut help text', () => {
    const { getByRole } = render(SearchInput, {
      props: { value: '', onCommit: vi.fn() },
    });

    const input = getByRole('searchbox', { name: 'search this workspace' });
    const descriptionId = input.getAttribute('aria-describedby');

    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId as string)?.textContent).toContain('enter to commit');
  });

  it('enter commits immediately', async () => {
    const onCommit = vi.fn();
    const { getByPlaceholderText } = render(SearchInput, {
      props: { value: '', onCommit, debounceMs: 200 },
    });
    const input = getByPlaceholderText('search this workspace...');

    await fireEvent.input(input, { target: { value: 'work' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCommit).toHaveBeenCalledWith('work');
  });

  it('escape clears value and commits an empty query', async () => {
    const onCommit = vi.fn();
    const onValueChange = vi.fn();
    const { getByPlaceholderText } = render(SearchInput, {
      props: { value: 'coffee', onCommit, onValueChange, debounceMs: 200 },
    });
    const input = getByPlaceholderText('search this workspace...') as HTMLInputElement;

    await fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.value).toBe('');
    expect(onValueChange).toHaveBeenCalledWith('');
    expect(onCommit).toHaveBeenCalledWith('');
  });
});
