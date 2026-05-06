/**
 * Curry a function by pre-filling its arguments.
 */
export declare const curry: (
  fnOrArg: (...args: unknown[]) => unknown | unknown,
  ...args: unknown[]
) => unknown
