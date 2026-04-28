import { type ChatEvent, isChatEvent } from './events';

const EVENT_BOUNDARY = /(\r?\n){2}|\r{2}/;

interface SseParser {
  /** Push a string chunk; returns 0+ events parsed from the accumulated buffer. */
  push(chunk: string): ChatEvent[];
  /** Flush any complete events still in the buffer. Does not emit partial events. */
  flush(): ChatEvent[];
}

export function createSseParser(): SseParser {
  let buffer = '';

  function drain(): ChatEvent[] {
    const events: ChatEvent[] = [];

    let match = EVENT_BOUNDARY.exec(buffer);
    while (match) {
      const boundary = match.index;
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + match[0].length);

      const dataLines: string[] = [];
      for (const line of block.split(/\r\n|\r|\n/)) {
        if (line.startsWith(':')) continue;
        if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart());
        }
      }

      if (dataLines.length > 0) {
        const raw = dataLines.join('\n');
        try {
          const parsed = JSON.parse(raw);
          if (isChatEvent(parsed)) events.push(parsed);
        } catch {
          // skip malformed JSON
        }
      }

      match = EVENT_BOUNDARY.exec(buffer);
    }

    return events;
  }

  return {
    push(chunk: string) {
      buffer += chunk;
      return drain();
    },
    flush() {
      return drain();
    },
  };
}
