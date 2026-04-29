import type { components } from '../../../src/lib/honcho/types';

export const fixtureWorkspaces = [
  { id: 'ws-alpha', metadata: { name: 'alpha' }, configuration: {}, created_at: '2026-04-28T10:00:00Z' },
  { id: 'ws-beta', metadata: { name: 'beta' }, configuration: {}, created_at: '2026-04-28T10:01:00Z' },
];

export const fixturePeers = [
  {
    id: 'peer-1',
    workspace_id: 'ws-alpha',
    metadata: { name: 'hermes' },
    configuration: {},
    created_at: '2026-04-28T10:02:00Z',
  },
  {
    id: 'peer-2',
    workspace_id: 'ws-alpha',
    metadata: { name: 'iris' },
    configuration: {},
    created_at: '2026-04-28T10:03:00Z',
  },
];

export const fixtureSessions = [
  {
    id: 'sess-1',
    is_active: true,
    workspace_id: 'ws-alpha',
    metadata: {},
    configuration: {},
    created_at: '2026-04-28T12:34:56Z',
  },
  {
    id: 'sess-2',
    is_active: true,
    workspace_id: 'ws-alpha',
    metadata: {},
    configuration: {},
    created_at: '2026-04-28T11:22:33Z',
  },
];

/** Generates 120 messages, alternating roles, in reverse chronological order. */
export function generateMessageHistory(): components['schemas']['Message'][] {
  const messages: components['schemas']['Message'][] = [];
  const start = new Date('2026-04-28T12:00:00Z').getTime();

  for (let i = 0; i < 120; i++) {
    messages.push({
      id: `m-${String(i).padStart(3, '0')}`,
      peer_id: i % 2 === 0 ? 'peer-1' : 'assistant-peer',
      session_id: 'sess-1',
      workspace_id: 'ws-alpha',
      content: `message body ${i} - body of message ${i} which is testing scroll-back to previous pages`,
      metadata: {},
      created_at: new Date(start - i * 60_000).toISOString(),
      token_count: 10,
    });
  }

  return messages;
}

export const fixtureMessageHistory = generateMessageHistory();

export const fixtureRepresentation = {
  topics: ['coffee', 'sleep', 'work'],
  items: [
    {
      id: 'r1',
      topic: 'coffee',
      content: 'prefers oat milk',
      confidence: 0.92,
      createdAt: '2026-04-20T10:00:00Z',
    },
    {
      id: 'r2',
      topic: 'coffee',
      content: 'medium roast over dark',
      confidence: 0.78,
      createdAt: '2026-04-21T10:00:00Z',
    },
    {
      id: 'r3',
      topic: 'sleep',
      content: 'late riser, ~9am natural',
      confidence: 0.85,
      createdAt: '2026-04-22T10:00:00Z',
    },
    {
      id: 'r4',
      topic: 'work',
      content: 'remote, async-first',
      confidence: 0.95,
      createdAt: '2026-04-23T10:00:00Z',
    },
    {
      id: 'r5',
      topic: 'work',
      content: 'prefers writing over calls',
      confidence: 0.81,
      createdAt: '2026-04-24T10:00:00Z',
    },
  ],
};

export const fixtureRepresentationMarkdown = fixtureRepresentation.topics
  .map((topic) => {
    const items = fixtureRepresentation.items
      .filter((item) => item.topic === topic)
      .map((item) => `- ${item.content}`)
      .join('\n');
    return `## ${topic}\n${items}`;
  })
  .join('\n\n');

export const fixtureMaliciousRepresentationMarkdown = `${fixtureRepresentationMarkdown}

<script>window.__profileXss = true</script>
<img src=x onerror="window.__profileXss = true">`;

export const fixtureSearchResults: components['schemas']['Message'][] = [
  {
    id: 's1',
    peer_id: 'peer-1',
    session_id: 'sess-1',
    workspace_id: 'ws-alpha',
    content: 'prefers oat milk in coffee',
    metadata: { peer_name: 'hermes', topic: 'coffee', score: 0.92 },
    created_at: '2026-04-20T10:00:00Z',
    token_count: 5,
  },
  {
    id: 's2',
    peer_id: 'peer-2',
    session_id: 'sess-2',
    workspace_id: 'ws-alpha',
    content: 'drinks coffee mostly in the morning',
    metadata: { peer_name: 'iris', topic: 'coffee', score: 0.78 },
    created_at: '2026-04-21T11:00:00Z',
    token_count: 6,
  },
  {
    id: 's3',
    peer_id: 'peer-1',
    session_id: 'sess-1',
    workspace_id: 'ws-alpha',
    content: 'coffee chats cover remote work, async-first communication',
    metadata: { peer_name: 'hermes', topic: 'work', score: 0.65 },
    created_at: '2026-04-22T09:00:00Z',
    token_count: 8,
  },
];
