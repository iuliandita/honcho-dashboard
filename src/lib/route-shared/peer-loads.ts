import { type ClientFetch, createApiClient } from '$api/client';
import { buildPeersQuery, buildSessionsQuery } from '$features/browser/api';
import { buildSessionMessagesQuery } from '$features/messages/api';
import { buildPeerProfileQuery } from '$features/profile/api';
import { buildPeerRepresentationQuery } from '$features/representation/api';
import { buildWorkspaceSearchQuery } from '$features/search/api';

type PeerParent = () => Promise<{ workspaceId: string; peerId: string }>;
type WorkspaceParent = () => Promise<{ workspaceId: string }>;

export async function loadWorkspacePeers(fetch: ClientFetch, workspaceId: string) {
  const client = createApiClient({ fetch });
  const peers = await buildPeersQuery(client, workspaceId).queryFn();
  return { peers };
}

export async function loadPinnedPeers(fetch: ClientFetch, parent: WorkspaceParent) {
  const { workspaceId } = await parent();
  return { ...(await loadWorkspacePeers(fetch, workspaceId)), workspaceId };
}

export async function loadPeerSessions(fetch: ClientFetch, parent: PeerParent) {
  const { workspaceId, peerId } = await parent();
  const client = createApiClient({ fetch });
  const sessions = await buildSessionsQuery(client, workspaceId, peerId).queryFn();
  return { sessions };
}

export async function loadPeerChat(parent: PeerParent) {
  const { workspaceId, peerId } = await parent();
  return { workspaceId, peerId };
}

export async function loadPeerProfile(fetch: ClientFetch, parent: PeerParent) {
  const { workspaceId, peerId } = await parent();
  const client = createApiClient({ fetch });
  const profile = await buildPeerProfileQuery(client, workspaceId, peerId).queryFn();
  return { profile };
}

export async function loadPeerRepresentation(fetch: ClientFetch, parent: PeerParent) {
  const { workspaceId, peerId } = await parent();
  const client = createApiClient({ fetch });
  const representation = await buildPeerRepresentationQuery(client, workspaceId, peerId).queryFn();
  return { representation };
}

export async function loadSessionMessages(
  fetch: ClientFetch,
  parent: WorkspaceParent,
  params: { peerId: string; sessionId: string },
) {
  const { workspaceId } = await parent();
  const client = createApiClient({ fetch });
  const query = buildSessionMessagesQuery(client, workspaceId, params.peerId, params.sessionId);
  const firstPage = await query.queryFn({
    pageParam: 1,
    queryKey: query.queryKey,
    meta: undefined,
    direction: 'forward',
  });
  return { firstPage, sessionId: params.sessionId };
}

export async function loadWorkspaceSearch(fetch: ClientFetch, parent: WorkspaceParent, url: URL) {
  const { workspaceId } = await parent();
  const q = url.searchParams.get('q') ?? '';
  const topic = url.searchParams.get('topic') || null;

  let initialResponse = null;
  if (q.trim()) {
    const client = createApiClient({ fetch });
    initialResponse = await buildWorkspaceSearchQuery(client, workspaceId, q, topic).queryFn();
  }

  return { initialQuery: q, initialTopic: topic, initialResponse };
}
