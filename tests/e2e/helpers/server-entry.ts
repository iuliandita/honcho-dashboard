import { Hono } from 'hono';
import { createApp } from '../../../src/server';
import {
  fixtureMaliciousRepresentationMarkdown,
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
    c.json({
      representation:
        c.req.param('peer') === 'peer-xss' ? fixtureMaliciousRepresentationMarkdown : fixtureRepresentationMarkdown,
    }),
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
    const body = await c.req.json<{ query?: string; stream?: boolean; reasoning_level?: string }>();
    if (body.stream !== true || !body.reasoning_level) {
      return c.json({ detail: 'stream and reasoning_level are required' }, 422);
    }

    if (body.query === 'force 4xx') {
      return c.json({ detail: 'dialectic denied' }, 422);
    }

    if (body.query === 'malformed sse') {
      return streamResponse([
        'not-a-field\n\n',
        'data: {bad-json}\n\n',
        'event: token\nid: 1\nretry: 1000\ndata: {"type":"token","data":"clean token after malformed"}\n\n',
        'data: {"type":"done"}\n\n',
      ]);
    }

    if (body.query === 'split utf8') {
      const enc = new TextEncoder();
      const token = enc.encode('data: {"type":"token","data":"cafe ☕"}\n\n');
      const firstCoffeeByte = enc.encode('☕')[0];
      if (firstCoffeeByte === undefined) throw new Error('failed to encode test fixture');
      const coffeeIndex = token.indexOf(firstCoffeeByte);
      return byteStreamResponse([
        token.slice(0, coffeeIndex + 1),
        token.slice(coffeeIndex + 1),
        enc.encode('data: {"type":"done"}\n\n'),
      ]);
    }

    if (body.query === 'done then trailing') {
      return streamResponse([
        'data: {"type":"token","data":"finished cleanly"}\n\n',
        'data: {"type":"done"}\n\ndata: {"type":"token","data":" should not render"}\n\n',
      ]);
    }

    if (body.query === 'midstream 5xx') {
      return failingStreamResponse();
    }

    // Canned scripted response — three tokens then done.
    return streamResponse([
      'data: {"type":"token","data":"this peer "}\n\n',
      'data: {"type":"token","data":"likes "}\n\n',
      'data: {"type":"token","data":"oat milk."}\n\n',
      'data: {"type":"done"}\n\n',
    ]);
  });
  honcho.notFound((c) => c.json({ error: 'not found', status: 404 }, 404));

  return Bun.serve({ port, fetch: honcho.fetch });
}

function streamResponse(chunks: string[]) {
  const enc = new TextEncoder();
  return byteStreamResponse(chunks.map((chunk) => enc.encode(chunk)));
}

function byteStreamResponse(chunks: Uint8Array[]) {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
        await new Promise((r) => setTimeout(r, 50));
      }
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
}

function failingStreamResponse() {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(enc.encode('data: {"type":"token","data":"partial before failure"}\n\n'));
      await new Promise((r) => setTimeout(r, 50));
      controller.error(new Error('upstream 500 mid-stream'));
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
    version: process.env.HONCHO_DASHBOARD_VERSION ?? '0.1.0-test',
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
