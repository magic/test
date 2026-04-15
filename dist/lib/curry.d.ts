/**
 * Curry a function by pre-filling its arguments.
 */
export declare function curry(
  fnOrArg: (...args: unknown[]) => unknown | unknown,
  ...args: unknown[]
): unknown
