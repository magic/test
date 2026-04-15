/**
 * MockFn interface
 */
interface MockFn {
  (...args: unknown[]): unknown
  callCount: number
  calls: unknown[][]
  returns: unknown[]
  errors: Array<Error | null>
  _returnValue: unknown
  _throwError: Error | null
  mockReturnValue: (value: unknown) => MockFn
  mockThrow: (error: Error) => MockFn
  getCalls: () => unknown[][]
  getReturns: () => unknown[]
  getErrors: () => Array<Error | null>
  mockRestore?: () => void
}
/**
 * Create a mock function with call tracking.
 */
export declare const fn: (implementation?: (...args: unknown[]) => unknown) => MockFn
/**
 * Create a spy that wraps an object's method.
 */
export declare const spy: (
  obj: Record<string, unknown>,
  methodName: string,
  implementation?: (...args: unknown[]) => unknown,
) => MockFn & {
  mockRestore: () => void
}
export declare const log: {
  log: (..._: unknown[]) => boolean
  warn: (..._: unknown[]) => boolean
  error: (..._: unknown[]) => boolean
  time: (..._: unknown[]) => boolean
  timeEnd: (..._: unknown[]) => boolean
}
export {}
