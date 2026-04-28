import { type ChatEvent, isChatEvent } from './events';

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

    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const dataLines: string[] = [];
      for (const line of block.split('\n')) {
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

      boundary = buffer.indexOf('\n\n');
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
