import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import RepresentationGrid from './RepresentationGrid.svelte';
import type { RepresentationResponse } from './api';

const data: RepresentationResponse = {
  topics: ['coffee', 'work'],
  items: [
    {
      id: 'r1',
      topic: 'coffee',
      content: 'prefers oat milk',
      createdAt: '2026-04-29T08:00:00Z',
    },
    {
      id: 'r2',
      topic: 'coffee',
      content: 'medium roast',
      createdAt: '2026-04-29T09:00:00Z',
    },
    {
      id: 'r3',
      topic: 'work',
      content: 'async-first',
      createdAt: '2026-04-28T09:00:00Z',
    },
  ],
};

describe('<RepresentationGrid>', () => {
  it('shows focused topic operator context after selecting a topic', async () => {
    render(RepresentationGrid, { props: { data } });

    await fireEvent.click(screen.getByRole('button', { name: /coffee/ }));

    expect(screen.getByText('selected topic')).toBeTruthy();
    expect(screen.getAllByText('coffee').length).toBeGreaterThan(0);
    expect(screen.getByText('2 / 3')).toBeTruthy();
    expect(screen.getByText('2026-04-29 09:00')).toBeTruthy();
  });
});
