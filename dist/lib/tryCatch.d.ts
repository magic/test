export declare const tryCatch: (
  fn: (...args: unknown[]) => unknown,
  ...args: unknown[]
) => () => Promise<unknown>
