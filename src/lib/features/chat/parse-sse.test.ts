import { describe, expect, it } from 'vitest';
import type { ChatEvent } from './events';
import { createSseParser } from './parse-sse';

function pushAll(parser: ReturnType<typeof createSseParser>, chunks: string[]): ChatEvent[] {
  const events: ChatEvent[] = [];
  for (const chunk of chunks) {
    for (const ev of parser.push(chunk)) events.push(ev);
  }
  return events;
}

describe('createSseParser', () => {
  it('parses a single token event', () => {
    const parser = createSseParser();
    const events = pushAll(parser, ['data: {"type":"token","data":"hello"}\n\n']);
    expect(events).toEqual([{ type: 'token', data: 'hello' }]);
  });

  it('parses multiple events in one chunk', () => {
    const parser = createSseParser();
    const events = pushAll(parser, ['data: {"type":"token","data":"a"}\n\ndata: {"type":"token","data":"b"}\n\n']);
    expect(events).toEqual([
      { type: 'token', data: 'a' },
      { type: 'token', data: 'b' },
    ]);
  });

  it('handles event split across chunks', () => {
    const parser = createSseParser();
    const events = pushAll(parser, ['data: {"type":"toke', 'n","data":"hello"}\n\n']);
    expect(events).toEqual([{ type: 'token', data: 'hello' }]);
  });

  it('handles boundary split across chunks', () => {
    const parser = createSseParser();
    const events = pushAll(parser, ['data: {"type":"token","data":"a"}\n', '\ndata: {"type":"token","data":"b"}\n\n']);
    expect(events).toEqual([
      { type: 'token', data: 'a' },
      { type: 'token', data: 'b' },
    ]);
  });

  it('accepts CRLF and CR-only event separators', () => {
    const parser = createSseParser();
    const events = pushAll(parser, [
      'data: {"type":"token","data":"crlf"}\r\n\r\n',
      'data: {"type":"token","data":"cr"}\r\r',
    ]);

    expect(events).toEqual([
      { type: 'token', data: 'crlf' },
      { type: 'token', data: 'cr' },
    ]);
  });

  it('ignores SSE metadata fields while preserving data lines', () => {
    const parser = createSseParser();
    const events = pushAll(parser, [
      'event: token\nid: 42\nretry: 1000\ndata: {"type":"token","data":"metadata ignored"}\n\n',
    ]);

    expect(events).toEqual([{ type: 'token', data: 'metadata ignored' }]);
  });

  it('parses done events', () => {
    const parser = createSseParser();
    const events = pushAll(parser, ['data: {"type":"done"}\n\n']);
    expect(events).toEqual([{ type: 'done' }]);
  });

  it('normalizes Honcho OpenAI-style delta and done events', () => {
    const parser = createSseParser();
    const events = pushAll(parser, [
      'data: {"delta":{"content":"hello "},"done":false}\n\n',
      'data: {"delta":{"content":"world"},"done":false}\n\n',
      'data: {"done":true}\n\n',
    ]);
    expect(events).toEqual([{ type: 'token', data: 'hello ' }, { type: 'token', data: 'world' }, { type: 'done' }]);
  });

  it('parses error events', () => {
    const parser = createSseParser();
    const events = pushAll(parser, ['data: {"type":"error","data":"upstream lost"}\n\n']);
    expect(events).toEqual([{ type: 'error', data: 'upstream lost' }]);
  });

  it('ignores comment lines', () => {
    const parser = createSseParser();
    const events = pushAll(parser, [': keep-alive\n\ndata: {"type":"token","data":"x"}\n\n']);
    expect(events).toEqual([{ type: 'token', data: 'x' }]);
  });

  it('flushes returns nothing when buffer is empty or partial', () => {
    const parser = createSseParser();
    expect(parser.flush()).toEqual([]);

    parser.push('data: {"type":"token","data":"x"}');
    expect(parser.flush()).toEqual([]);
  });

  it('skips malformed JSON gracefully', () => {
    const parser = createSseParser();
    const events = pushAll(parser, ['data: {bad-json}\n\ndata: {"type":"token","data":"ok"}\n\n']);
    expect(events).toEqual([{ type: 'token', data: 'ok' }]);
  });

  it('skips events that do not match the schema', () => {
    const parser = createSseParser();
    const events = pushAll(parser, ['data: {"type":"unknown","stuff":1}\n\ndata: {"type":"token","data":"ok"}\n\n']);
    expect(events).toEqual([{ type: 'token', data: 'ok' }]);
  });
});
