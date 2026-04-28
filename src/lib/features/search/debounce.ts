export interface Debounced<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel(): void;
}

export function debounce<T extends (...args: never[]) => unknown>(fn: T, delayMs: number): Debounced<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  }) as Debounced<T>;

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}
