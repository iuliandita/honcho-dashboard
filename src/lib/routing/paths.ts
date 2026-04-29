export type PeerTab = 'sessions' | 'representation' | 'profile' | 'chat';

export function segment(value: string): string {
  return encodeURIComponent(value);
}

export function workspacePath(workspaceId: string): string {
  return `/workspaces/${segment(workspaceId)}`;
}

export function peerPath(peerId: string, workspaceId?: string): string {
  return workspaceId ? `${workspacePath(workspaceId)}/peers/${segment(peerId)}` : `/peers/${segment(peerId)}`;
}

export function peerCollectionPath(workspaceId?: string): string {
  return workspaceId ? `${workspacePath(workspaceId)}/peers` : '/peers';
}

export function peerTabPath(peerId: string, tab: PeerTab, workspaceId?: string): string {
  const base = peerPath(peerId, workspaceId);
  return tab === 'sessions' ? base : `${base}/${tab}`;
}

export function sessionPath(peerId: string, sessionId: string, workspaceId?: string): string {
  return `${peerPath(peerId, workspaceId)}/sessions/${segment(sessionId)}`;
}

export function searchPath(workspaceId?: string): string {
  return workspaceId ? `${workspacePath(workspaceId)}/search` : '/search';
}

export const honchoApiPaths = {
  peersList: (workspaceId: string) => `/v3/workspaces/${segment(workspaceId)}/peers/list`,
  sessionsForPeer: (workspaceId: string, peerId: string) =>
    `/v3/workspaces/${segment(workspaceId)}/peers/${segment(peerId)}/sessions`,
  sessionMessages: (workspaceId: string, sessionId: string) =>
    `/v3/workspaces/${segment(workspaceId)}/sessions/${segment(sessionId)}/messages/list`,
  peerRepresentation: (workspaceId: string, peerId: string) =>
    `/v3/workspaces/${segment(workspaceId)}/peers/${segment(peerId)}/representation`,
  workspaceSearch: (workspaceId: string) => `/v3/workspaces/${segment(workspaceId)}/search`,
  peerChat: (workspaceId: string, peerId: string) =>
    `/v3/workspaces/${segment(workspaceId)}/peers/${segment(peerId)}/chat`,
} as const;
