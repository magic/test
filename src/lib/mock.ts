import { env } from './env.ts'

/**
 * MockFn interface
 */
interface MockFn {
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
export const fn = (implementation?: (...args: unknown[]) => unknown): MockFn => {
  const mockFn = (...args: unknown[]): unknown => {
    mockFn.calls.push(args)

    if (mockFn._throwError) {
      mockFn.errors.push(mockFn._throwError)
      mockFn.returns.push(undefined)
      mockFn.callCount++
      throw mockFn._throwError
    }

    const result = implementation ? implementation(...args) : mockFn._returnValue
    mockFn.returns.push(result)
    mockFn.errors.push(null)
    mockFn.callCount++

    return result
  }

  mockFn.calls = [] as unknown[][]
  mockFn.returns = [] as unknown[]
  mockFn.errors = [] as Array<Error | null>
  mockFn.callCount = 0
  mockFn._returnValue = undefined as unknown
  mockFn._throwError = null as Error | null

  mockFn.mockReturnValue = function (value: unknown): MockFn {
    mockFn._returnValue = value
    mockFn._throwError = null
    return mockFn
  }

  mockFn.mockThrow = function (error: Error): MockFn {
    mockFn._throwError = error
    mockFn._returnValue = undefined as unknown
    return mockFn
  }

  mockFn.getCalls = function (): unknown[][] {
    return mockFn.calls
  }
  mockFn.getReturns = function (): unknown[] {
    return mockFn.returns
  }
  mockFn.getErrors = function (): Array<Error | null> {
    return mockFn.errors
  }

  return mockFn
}

/**
 * Create a spy that wraps an object's method.
 */
export const spy = (
  obj: Record<string, unknown>,
  methodName: string,
  implementation?: (...args: unknown[]) => unknown,
): MockFn & { mockRestore: () => void } => {
  const original = obj[methodName]
  const mockFn = fn(implementation)

  obj[methodName] = mockFn

  mockFn.mockRestore = (): void => {
    obj[methodName] = original
  }

  return mockFn as MockFn & { mockRestore: () => void }
}

export const log = {
  log: () => !env.isNodeProd(),
  warn: () => !env.isNodeProd(),
  error: () => true,
  time: () => !env.isNodeProd(),
  timeEnd: () => !env.isNodeProd(),
}
