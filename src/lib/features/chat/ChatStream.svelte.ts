import type { ClientFetch } from '$api/client';
import { HonchoApiError, parseErrorBody } from '$api/errors';
import type { components } from '$lib/honcho/types';
import type { ChatEvent } from './events';
import { createSseParser } from './parse-sse';

export interface ChatStreamConfig {
  workspaceId: string;
  peerId: string;
  /** Called on clean stream completion to refresh derived peer data (representation/profile). */
  invalidatePeer: (peerId: string) => Promise<void> | void;
  /** Inject for testing; defaults to global fetch. */
  fetch?: ClientFetch;
}

export class ChatStream {
  tokens = $state('');
  error = $state<HonchoApiError | null>(null);
  streamEnded = $state(false);
  expectedEnd = $state(false);
  startedAt = $state<number | null>(null);
  endedAt = $state<number | null>(null);

  isStreaming = $derived(this.startedAt !== null && !this.streamEnded);
  durationMs = $derived(this.startedAt && this.endedAt ? this.endedAt - this.startedAt : null);
  tokensPerSec = $derived.by(() => {
    if (!this.durationMs || this.durationMs === 0) return 0;
    return Math.round((this.tokens.length / (this.durationMs / 1000)) * 10) / 10;
  });

  private config: ChatStreamConfig;
  private abortController: AbortController | null = null;

  constructor(config: ChatStreamConfig) {
    this.config = config;
  }

  reset() {
    this.tokens = '';
    this.error = null;
    this.streamEnded = false;
    this.expectedEnd = false;
    this.startedAt = null;
    this.endedAt = null;
  }

  async send(query: string): Promise<void> {
    this.reset();
    this.startedAt = Date.now();
    this.abortController = new AbortController();

    const fetcher = this.config.fetch ?? globalThis.fetch;
    const url = `/api/v3/workspaces/${this.config.workspaceId}/peers/${this.config.peerId}/chat`;
    const body: components['schemas']['DialecticOptions'] = {
      query,
      stream: true,
      reasoning_level: 'low',
    };

    let response: Response;
    try {
      response = await fetcher(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify(body),
        signal: this.abortController.signal,
      });
    } catch (err) {
      this.error = new HonchoApiError(err instanceof Error ? err.message : 'fetch failed', {
        status: 0,
        traceId: '',
        upstream: 'proxy',
      });
      this.streamEnded = true;
      this.endedAt = Date.now();
      return;
    }

    if (!response.ok) {
      this.error = await parseErrorBody(response);
      this.streamEnded = true;
      this.endedAt = Date.now();
      return;
    }

    if (!response.body) {
      this.error = new HonchoApiError('response has no body', {
        status: response.status,
        traceId: response.headers.get('X-Trace-Id') ?? '',
        upstream: 'proxy',
      });
      this.streamEnded = true;
      this.endedAt = Date.now();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const parser = createSseParser();
    const traceId = response.headers.get('X-Trace-Id') ?? '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const ev of parser.push(chunk)) {
          this.handleEvent(ev, traceId);
          if (this.expectedEnd || this.error) break;
        }
        if (this.expectedEnd || this.error) break;
      }

      if (!this.expectedEnd && !this.error) {
        for (const ev of parser.flush()) {
          this.handleEvent(ev, traceId);
          if (this.expectedEnd || this.error) break;
        }
      }

      if (!this.expectedEnd && !this.error) {
        this.error = new HonchoApiError('stream interrupted before completion', {
          status: 0,
          traceId,
          upstream: 'honcho',
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // cancelled deliberately - leave error null
      } else {
        this.error = new HonchoApiError(err instanceof Error ? err.message : 'stream read failure', {
          status: 0,
          traceId,
          upstream: 'proxy',
        });
      }
    } finally {
      this.streamEnded = true;
      this.endedAt = Date.now();
      reader.releaseLock();
      this.abortController = null;

      if (this.expectedEnd && !this.error) {
        await this.config.invalidatePeer(this.config.peerId);
      }
    }
  }

  cancel(): void {
    this.abortController?.abort();
  }

  private handleEvent(event: ChatEvent, traceId: string): void {
    switch (event.type) {
      case 'token':
        this.tokens += event.data;
        break;
      case 'done':
        this.expectedEnd = true;
        break;
      case 'error':
        this.error = new HonchoApiError(event.data, {
          status: 0,
          traceId,
          upstream: 'honcho',
        });
        break;
    }
  }
}
