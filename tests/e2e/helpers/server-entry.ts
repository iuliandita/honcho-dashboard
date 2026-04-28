import { Hono } from 'hono';
import { createApp } from '../../../src/server';
import { fixtureMessageHistory, fixturePeers, fixtureSessions, fixtureWorkspaces } from './fixtures';

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
  honcho.get('/v3/workspaces/:ws/peers/:peer/sessions/:session/messages', (c) => {
    const cursor = c.req.query('cursor');
    const limit = Number.parseInt(c.req.query('limit') ?? String(PAGE_SIZE), 10);
    const startIdx = cursor ? Number.parseInt(cursor, 10) : 0;
    const slice = fixtureMessageHistory.slice(startIdx, startIdx + limit);
    const nextStart = startIdx + slice.length;
    const nextCursor = nextStart < fixtureMessageHistory.length ? String(nextStart) : null;
    return c.json({ messages: slice, cursor: nextCursor });
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
