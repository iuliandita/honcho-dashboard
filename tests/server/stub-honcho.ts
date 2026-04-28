import { Hono } from 'hono';

export interface StubRequest {
  method: string;
  path: string;
  authorization: string | null;
  body: string | null;
}

export interface StubHoncho {
  app: Hono;
  requests: StubRequest[];
  reset: () => void;
}

export function createStubHoncho(): StubHoncho {
  const requests: StubRequest[] = [];
  const app = new Hono();

  app.use('*', async (c, next) => {
    requests.push({
      method: c.req.method,
      path: c.req.path,
      authorization: c.req.header('Authorization') ?? null,
      body: c.req.method !== 'GET' ? await c.req.text() : null,
    });
    await next();
  });

  app.get('/peers/:id', (c) => c.json({ id: c.req.param('id'), name: 'test-peer' }));
  app.get('/peers/:id/representation', (c) => c.json({ peerId: c.req.param('id'), topics: [] }));
  app.post('/peers/:id/chat', (c) => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"token","data":"hello"}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: {"type":"done"}\n\n'));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  });
  app.notFound((c) => c.json({ error: 'not found', status: 404 }, 404));

  return {
    app,
    requests,
    reset: () => {
      requests.length = 0;
    },
  };
}
