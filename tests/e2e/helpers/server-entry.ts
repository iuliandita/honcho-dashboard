import { Hono } from 'hono';
import { createApp } from '../../../src/server';
import {
  fixtureMessageHistory,
  fixturePeers,
  fixtureProfile,
  fixtureRepresentationMarkdown,
  fixtureSearchResults,
  fixtureSessions,
  fixtureWorkspaces,
} from './fixtures';

type ServerKind = 'dashboard' | 'honcho';
const PAGE_SIZE = 50;

function readArg(index: number, name: string): string {
  const value = process.argv[index];
  if (!value) throw new Error(`missing ${name}`);
  return value;
}

function startHoncho(port: number) {
  const honcho = new Hono();

  honcho.post('/v3/workspaces/list', (c) => c.json(fixtureWorkspaces));
  honcho.post('/v3/workspaces/:ws/peers/list', (c) => c.json(fixturePeers));
  honcho.post('/v3/workspaces/:ws/peers/:peer/sessions', (c) => c.json(fixtureSessions));
  honcho.post('/v3/workspaces/:ws/peers/:peer/representation', (c) =>
    c.json({ representation: fixtureRepresentationMarkdown }),
  );
  honcho.get('/v3/workspaces/:ws/peers/:peer/profile', (c) => c.json(fixtureProfile));
  honcho.get('/v3/workspaces/:ws/search', (c) => {
    const q = c.req.query('q')?.toLowerCase() ?? '';
    const topic = c.req.query('topic') ?? null;

    const filtered = fixtureSearchResults.filter((result) => {
      const matchesQuery = q === '' || result.excerpt.toLowerCase().includes(q);
      const matchesTopic = topic === null || result.topic === topic;
      return matchesQuery && matchesTopic;
    });

    const allMatching = fixtureSearchResults.filter((result) => q === '' || result.excerpt.toLowerCase().includes(q));
    const topicFacets = allMatching.reduce<Record<string, number>>((acc, result) => {
      acc[result.topic] = (acc[result.topic] ?? 0) + 1;
      return acc;
    }, {});

    return c.json({ results: filtered, topicFacets });
  });
  honcho.get('/v3/workspaces/:ws/peers/:peer/sessions/:session/messages', (c) => {
    const cursor = c.req.query('cursor');
    const limit = Number.parseInt(c.req.query('limit') ?? String(PAGE_SIZE), 10);
    const startIdx = cursor ? Number.parseInt(cursor, 10) : 0;
    const slice = fixtureMessageHistory.slice(startIdx, startIdx + limit);
    const nextStart = startIdx + slice.length;
    const nextCursor = nextStart < fixtureMessageHistory.length ? String(nextStart) : null;
    return c.json({ messages: slice, cursor: nextCursor });
  });
  honcho.post('/v3/workspaces/:ws/peers/:peer/chat', () => {
    // Canned scripted response — three tokens then done.
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode('data: {"type":"token","data":"this peer "}\n\n'));
        await new Promise((r) => setTimeout(r, 50));
        controller.enqueue(enc.encode('data: {"type":"token","data":"likes "}\n\n'));
        await new Promise((r) => setTimeout(r, 50));
        controller.enqueue(enc.encode('data: {"type":"token","data":"oat milk."}\n\n'));
        await new Promise((r) => setTimeout(r, 50));
        controller.enqueue(enc.encode('data: {"type":"done"}\n\n'));
        controller.close();
      },
    });
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  });
  honcho.notFound((c) => c.json({ error: 'not found', status: 404 }, 404));

  return Bun.serve({ port, fetch: honcho.fetch });
}

function startDashboard(port: number) {
  const apiBase = readArg(4, 'apiBase');
  const adminToken = readArg(5, 'adminToken');
  const workspaceIdArg = readArg(6, 'workspaceId');

  process.env.LOG_LEVEL = 'silent';

  const app = createApp({
    apiBase,
    adminToken,
    workspaceId: workspaceIdArg === '__NULL__' ? null : workspaceIdArg,
    version: '0.1.0-test',
    timeoutMs: 5000,
    buildDir: './build',
  });

  return Bun.serve({ port, fetch: app.fetch });
}

const kind = readArg(2, 'kind') as ServerKind;
const port = Number.parseInt(process.argv[3] ?? '0', 10);
const server = kind === 'honcho' ? startHoncho(port) : startDashboard(port);

process.stdout.write(`${JSON.stringify({ type: 'ready', url: `http://127.0.0.1:${server.port}` })}\n`);

process.on('SIGTERM', () => {
  server.stop(true);
  process.exit(0);
});
