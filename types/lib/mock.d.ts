export function fn(implementation?: (...args: unknown[]) => unknown): MockFn
export function spy(
  object: Object,
  methodName: string,
  implementation?: (...args: unknown[]) => unknown,
): MockFn & {
  mockRestore: () => void
}
export namespace log {
  function log(): boolean
  function warn(): boolean
  function error(): boolean
  function time(): boolean
  function timeEnd(): boolean
}
export type MockFn = {
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
  mockRestore?: (() => void) | undefined
}
//# sourceMappingURL=mock.d.ts.map
