import { Hono } from 'hono';
import { createApp } from '../../../src/server';
import {
  fixtureMessageHistory,
  fixturePeers,
  fixtureRepresentationMarkdown,
  fixtureSearchResults,
  fixtureSessions,
  fixtureWorkspaces,
} from './fixtures';

type ServerKind = 'dashboard' | 'honcho';
const PAGE_SIZE = 50;

function page<T>(items: T[], pageNumber = 1, size = PAGE_SIZE) {
  return {
    items,
    total: items.length,
    page: pageNumber,
    size,
    pages: Math.max(1, Math.ceil(items.length / size)),
  };
}

function readArg(index: number, name: string): string {
  const value = process.argv[index];
  if (!value) throw new Error(`missing ${name}`);
  return value;
}

function startHoncho(port: number) {
  const honcho = new Hono();

  honcho.post('/v3/workspaces/list', (c) => c.json(page(fixtureWorkspaces)));
  honcho.post('/v3/workspaces/:ws/peers/list', (c) => c.json(page(fixturePeers)));
  honcho.post('/v3/workspaces/:ws/peers/:peer/sessions', (c) => c.json(page(fixtureSessions)));
  honcho.post('/v3/workspaces/:ws/peers/:peer/representation', (c) =>
    c.json({ representation: fixtureRepresentationMarkdown }),
  );
  honcho.post('/v3/workspaces/:ws/search', async (c) => {
    const body = await c.req.json<{ query?: string; filters?: { topic?: string } | null }>();
    const q = body.query?.toLowerCase() ?? '';
    const topic = body.filters?.topic ?? null;

    const filtered = fixtureSearchResults.filter((result) => {
      const matchesQuery = q === '' || result.content.toLowerCase().includes(q);
      const matchesTopic = topic === null || result.metadata?.topic === topic;
      return matchesQuery && matchesTopic;
    });

    return c.json(filtered);
  });
  honcho.post('/v3/workspaces/:ws/sessions/:session/messages/list', (c) => {
    const pageNumber = Number.parseInt(c.req.query('page') ?? '1', 10);
    const size = Number.parseInt(c.req.query('size') ?? String(PAGE_SIZE), 10);
    const startIdx = (pageNumber - 1) * size;
    const slice = fixtureMessageHistory.slice(startIdx, startIdx + size);
    return c.json({
      items: slice,
      total: fixtureMessageHistory.length,
      page: pageNumber,
      size,
      pages: Math.max(1, Math.ceil(fixtureMessageHistory.length / size)),
    });
  });
  honcho.post('/v3/workspaces/:ws/peers/:peer/chat', async (c) => {
    const body = await c.req.json<{ stream?: boolean; reasoning_level?: string }>();
    if (body.stream !== true || !body.reasoning_level) {
      return c.json({ detail: 'stream and reasoning_level are required' }, 422);
    }
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
