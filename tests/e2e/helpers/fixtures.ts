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
