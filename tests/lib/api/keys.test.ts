import { describe, expect, it } from 'vitest';
import { keys } from '../../../src/lib/api/keys';

describe('query-key helpers', () => {
  it('produces hierarchical workspace key', () => {
    expect(keys.workspace('ws-1')).toEqual(['workspace', 'ws-1']);
  });

  it('produces hierarchical peer key', () => {
    expect(keys.peer('ws-1', 'peer-1')).toEqual(['workspace', 'ws-1', 'peer', 'peer-1']);
  });

  it('produces hierarchical session key', () => {
    expect(keys.session('ws-1', 'peer-1', 'sess-1')).toEqual([
      'workspace',
      'ws-1',
      'peer',
      'peer-1',
      'session',
      'sess-1',
    ]);
  });

  it('produces messages key under session', () => {
    expect(keys.sessionMessages('ws-1', 'peer-1', 'sess-1')).toEqual([
      'workspace',
      'ws-1',
      'peer',
      'peer-1',
      'session',
      'sess-1',
      'messages',
    ]);
  });

  it('produces representation key under peer', () => {
    expect(keys.peerRepresentation('ws-1', 'peer-1')).toEqual([
      'workspace',
      'ws-1',
      'peer',
      'peer-1',
      'representation',
    ]);
  });

  it('produces profile key under peer', () => {
    expect(keys.peerProfile('ws-1', 'peer-1')).toEqual(['workspace', 'ws-1', 'peer', 'peer-1', 'profile']);
  });

  it('produces search key under workspace', () => {
    expect(keys.workspaceSearch('ws-1', 'query', 'topic')).toEqual(['workspace', 'ws-1', 'search', 'query', 'topic']);
  });

  it('produces all-workspaces list key', () => {
    expect(keys.allWorkspaces()).toEqual(['workspaces']);
  });
});
