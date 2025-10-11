export function argHandler<T>(
  r: (arg: ArgHandlerResult<T> | undefined) => void,
): (...args: Array<T | undefined | null>) => void
export function promise<T>(
  fn: (handler: (...args: Array<T | undefined | null>) => void) => void,
): () => Promise<ArgHandlerResult<T> | undefined>
/**
 * Result of calling a wrapped function — either a single value or an array of values.
 */
export type ArgHandlerResult<T> = T | T[]
//# sourceMappingURL=promise.d.ts.map
