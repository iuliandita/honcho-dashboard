import { describe, expect, it } from 'vitest';
import type { RepresentationItem } from './api';
import { filterByTopic } from './filter';

const items: RepresentationItem[] = [
  { id: '1', topic: 'coffee', content: 'oat milk', createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', topic: 'coffee', content: 'medium roast', createdAt: '2026-01-02T00:00:00Z' },
  { id: '3', topic: 'sleep', content: 'late riser', createdAt: '2026-01-03T00:00:00Z' },
  { id: '4', topic: 'work', content: 'remote', createdAt: '2026-01-04T00:00:00Z' },
];

describe('filterByTopic', () => {
  it('returns all items when topic is null', () => {
    expect(filterByTopic(items, null)).toHaveLength(4);
  });

  it('filters to a single topic', () => {
    const result = filterByTopic(items, 'coffee');

    expect(result).toHaveLength(2);
    expect(result.every((item) => item.topic === 'coffee')).toBe(true);
  });

  it('returns empty when no items match', () => {
    expect(filterByTopic(items, 'unknown')).toHaveLength(0);
  });
});
