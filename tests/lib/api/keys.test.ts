import { describe, expect, it } from 'vitest';
import { keys } from '../../../src/lib/api/keys';

describe('query-key helpers', () => {
  it('keeps the shared key hierarchy stable', () => {
    expect({
      allWorkspaces: keys.allWorkspaces(),
      workspace: keys.workspace('ws-1'),
      peer: keys.peer('ws-1', 'peer-1'),
      session: keys.session('ws-1', 'peer-1', 'sess-1'),
      messages: keys.sessionMessages('ws-1', 'peer-1', 'sess-1'),
      representation: keys.peerRepresentation('ws-1', 'peer-1'),
      profile: keys.peerProfile('ws-1', 'peer-1'),
      search: keys.workspaceSearch('ws-1', 'query', 'topic'),
    }).toMatchInlineSnapshot(`
      {
        "allWorkspaces": [
          "workspaces",
        ],
        "messages": [
          "workspace",
          "ws-1",
          "peer",
          "peer-1",
          "session",
          "sess-1",
          "messages",
        ],
        "peer": [
          "workspace",
          "ws-1",
          "peer",
          "peer-1",
        ],
        "profile": [
          "workspace",
          "ws-1",
          "peer",
          "peer-1",
          "profile",
        ],
        "representation": [
          "workspace",
          "ws-1",
          "peer",
          "peer-1",
          "representation",
        ],
        "search": [
          "workspace",
          "ws-1",
          "search",
          "query",
          "topic",
        ],
        "session": [
          "workspace",
          "ws-1",
          "peer",
          "peer-1",
          "session",
          "sess-1",
        ],
        "workspace": [
          "workspace",
          "ws-1",
        ],
      }
    `);
  });
});
