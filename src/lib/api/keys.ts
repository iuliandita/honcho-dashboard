/**
 * Hierarchical query keys mirroring Honcho's resource model.
 *
 * Invalidating a parent key cascades to all children: e.g.
 *   queryClient.invalidateQueries({ queryKey: keys.peer(ws, p) })
 * refetches representation, profile, sessions, and all session messages for that peer.
 */
export const keys = {
  allWorkspaces: () => ['workspaces'] as const,
  workspace: (ws: string) => ['workspace', ws] as const,
  peer: (ws: string, peer: string) => ['workspace', ws, 'peer', peer] as const,
  session: (ws: string, peer: string, session: string) => ['workspace', ws, 'peer', peer, 'session', session] as const,
  sessionMessages: (ws: string, peer: string, session: string) =>
    ['workspace', ws, 'peer', peer, 'session', session, 'messages'] as const,
  peerRepresentation: (ws: string, peer: string) => ['workspace', ws, 'peer', peer, 'representation'] as const,
  peerProfile: (ws: string, peer: string) => ['workspace', ws, 'peer', peer, 'profile'] as const,
  workspaceSearch: (ws: string, query: string, topic: string | null) =>
    ['workspace', ws, 'search', query, topic ?? ''] as const,
};
