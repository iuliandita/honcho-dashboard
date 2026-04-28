import type { RepresentationItem } from './api';

export function filterByTopic(items: RepresentationItem[], topic: string | null): RepresentationItem[] {
  if (topic === null) return items;
  return items.filter((item) => item.topic === topic);
}
