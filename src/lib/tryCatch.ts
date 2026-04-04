export const tryCatch =
  (fn: (...args: unknown[]) => unknown, ...args: unknown[]): (() => Promise<unknown>) =>
  async () => {
    try {
      return await fn(...args)
    } catch (e) {
      return e
    }
  }
