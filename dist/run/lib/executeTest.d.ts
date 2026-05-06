/**
 * Execute a single test function with proper isolation
 */
export declare const executeTest: (
  fn: ((...args: unknown[]) => unknown) | Promise<unknown> | unknown,
  _key: string,
  componentFile?: string,
  componentProps?: Record<string, unknown>,
) => Promise<unknown>
