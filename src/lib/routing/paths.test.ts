import { describe, expect, it } from 'vitest';
import { honchoApiPaths, peerPath, peerTabPath, searchPath, segment, sessionPath, workspacePath } from './paths';

describe('routing paths', () => {
  it('encodes every dynamic path segment', () => {
    expect(segment('ws /#?')).toBe('ws%20%2F%23%3F');
  });

  it('builds encoded app paths for workspaces, peers, sessions, and tabs', () => {
    expect(workspacePath('ws /#?')).toBe('/workspaces/ws%20%2F%23%3F');
    expect(peerPath('peer /#?', 'ws /#?')).toBe('/workspaces/ws%20%2F%23%3F/peers/peer%20%2F%23%3F');
    expect(peerPath('peer /#?')).toBe('/peers/peer%20%2F%23%3F');
    expect(peerTabPath('peer /#?', 'chat')).toBe('/peers/peer%20%2F%23%3F/chat');
    expect(sessionPath('peer /#?', 'session /#?', 'ws /#?')).toBe(
      '/workspaces/ws%20%2F%23%3F/peers/peer%20%2F%23%3F/sessions/session%20%2F%23%3F',
    );
    expect(searchPath('ws /#?')).toBe('/workspaces/ws%20%2F%23%3F/search');
  });

  it('builds encoded Honcho API paths', () => {
    expect(honchoApiPaths.peersList('ws /#?')).toBe('/v3/workspaces/ws%20%2F%23%3F/peers/list');
    expect(honchoApiPaths.sessionsForPeer('ws /#?', 'peer /#?')).toBe(
      '/v3/workspaces/ws%20%2F%23%3F/peers/peer%20%2F%23%3F/sessions',
    );
    expect(honchoApiPaths.sessionMessages('ws /#?', 'session /#?')).toBe(
      '/v3/workspaces/ws%20%2F%23%3F/sessions/session%20%2F%23%3F/messages/list',
    );
    expect(honchoApiPaths.peerRepresentation('ws /#?', 'peer /#?')).toBe(
      '/v3/workspaces/ws%20%2F%23%3F/peers/peer%20%2F%23%3F/representation',
    );
    expect(honchoApiPaths.workspaceSearch('ws /#?')).toBe('/v3/workspaces/ws%20%2F%23%3F/search');
    expect(honchoApiPaths.peerChat('ws /#?', 'peer /#?')).toBe(
      '/v3/workspaces/ws%20%2F%23%3F/peers/peer%20%2F%23%3F/chat',
    );
  });
});
