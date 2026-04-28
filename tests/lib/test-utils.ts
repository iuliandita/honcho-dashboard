import { vi } from 'vitest';
import type { ApiClient } from '../../src/lib/api/client';

export function mockClient<T>(data: T): ApiClient {
  return {
    get: vi.fn(async () => data) as ApiClient['get'],
    post: vi.fn(async () => data) as ApiClient['post'],
  };
}
