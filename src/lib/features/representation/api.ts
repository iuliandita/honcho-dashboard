import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';

export interface RepresentationItem {
  id: string;
  topic: string;
  content: string;
  confidence?: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface RepresentationResponse {
  items: RepresentationItem[];
  topics: string[];
}

interface HonchoRepresentationResponse {
  representation: string;
}

function isRepresentationResponse(value: unknown): value is RepresentationResponse {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<RepresentationResponse>;
  return Array.isArray(maybe.items) && Array.isArray(maybe.topics);
}

function isHonchoRepresentationResponse(value: unknown): value is HonchoRepresentationResponse {
  if (!value || typeof value !== 'object') return false;
  return typeof (value as Partial<HonchoRepresentationResponse>).representation === 'string';
}

function cleanContent(line: string): string {
  return line.replace(/^[-*]\s+/, '').trim();
}

function normalizeRepresentation(raw: unknown): RepresentationResponse {
  if (isRepresentationResponse(raw)) return raw;

  const representation = isHonchoRepresentationResponse(raw) ? raw.representation.trim() : '';
  if (!representation) return { items: [], topics: [] };

  let currentTopic = 'general';
  const topics: string[] = [];
  const items: RepresentationItem[] = [];

  function addTopic(topic: string) {
    if (!topics.includes(topic)) topics.push(topic);
  }

  for (const rawLine of representation.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading?.[1]) {
      currentTopic = heading[1].trim().toLowerCase();
      continue;
    }

    const content = cleanContent(line);
    if (!content) continue;

    addTopic(currentTopic);
    items.push({
      id: `representation-${items.length + 1}`,
      topic: currentTopic,
      content,
      createdAt: '',
    });
  }

  return { items, topics };
}

export function buildPeerRepresentationQuery(client: ApiClient, workspaceId: string, peerId: string) {
  return {
    queryKey: keys.peerRepresentation(workspaceId, peerId),
    queryFn: async () => {
      const raw = await client.post<unknown>(`/v3/workspaces/${workspaceId}/peers/${peerId}/representation`, {
        max_conclusions: null,
      });
      return normalizeRepresentation(raw);
    },
  };
}
