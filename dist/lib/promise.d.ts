/**
 * Result of calling a wrapped function — either a single value or an array of values.
 */
/**
 * Creates an argument handler that filters out `undefined` and `null` values,
 * and either returns a single argument or an array of arguments to the wrapped function.
 */
export declare const argHandler: (
  r: (arg: unknown | undefined) => void,
) => (...args: Array<unknown | undefined | null>) => void
/**
 * Wraps a function into a Promise-returning function, passing arguments via `argHandler`.
 */
export declare const promise: (
  fn: (handler: (...args: unknown[]) => void) => void,
) => () => Promise<unknown | undefined>
