import type { SearchResult } from '../../../src/lib/features/search/api';

export const fixtureWorkspaces = [
  { id: 'ws-alpha', name: 'alpha' },
  { id: 'ws-beta', name: 'beta' },
];

export const fixturePeers = [
  { id: 'peer-1', name: 'hermes' },
  { id: 'peer-2', name: 'iris' },
];

export const fixtureSessions = [
  { id: 'sess-1', updatedAt: '2026-04-28T12:34:56Z', messageCount: 42 },
  { id: 'sess-2', updatedAt: '2026-04-28T11:22:33Z', messageCount: 7 },
];

export interface FixtureMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

/** Generates 120 messages, alternating roles, in reverse chronological order. */
export function generateMessageHistory(): FixtureMessage[] {
  const messages: FixtureMessage[] = [];
  const start = new Date('2026-04-28T12:00:00Z').getTime();

  for (let i = 0; i < 120; i++) {
    const roles = ['user', 'assistant'] as const;
    messages.push({
      id: `m-${String(i).padStart(3, '0')}`,
      role: roles[i % 2] ?? 'user',
      content: `message body ${i} - body of message ${i} which is testing scroll-back to previous pages`,
      createdAt: new Date(start - i * 60_000).toISOString(),
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

export const fixtureProfile = {
  markdown: `# hermes

A peer who treats async-first communication as a default. Prefers writing over calls.

## habits

- **morning**: late riser, productive after 10am
- **work**: remote, async-first, deep-focus blocks
- **coffee**: oat milk, medium roast

## interests

Topics that come up across sessions:

- distributed systems
- self-hosted tooling
- the [Honcho project](https://honcho.dev)

> "if it's not in the repo, it didn't happen"

<script>alert(1)</script>
[unsafe](javascript:alert(1))
`,
  updatedAt: '2026-04-28T12:00:00Z',
};

export const fixtureSearchResults: SearchResult[] = [
  {
    id: 's1',
    peerId: 'peer-1',
    peerName: 'hermes',
    topic: 'coffee',
    excerpt: 'prefers oat milk in coffee',
    score: 0.92,
    updatedAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 's2',
    peerId: 'peer-2',
    peerName: 'iris',
    topic: 'coffee',
    excerpt: 'drinks coffee mostly in the morning',
    score: 0.78,
    updatedAt: '2026-04-21T11:00:00Z',
  },
  {
    id: 's3',
    peerId: 'peer-1',
    peerName: 'hermes',
    topic: 'work',
    excerpt: 'coffee chats cover remote work, async-first communication',
    score: 0.65,
    updatedAt: '2026-04-22T09:00:00Z',
  },
];
