import { env } from './env.js'

/**
 * @typedef {Object} MockFn
 * @property {number} callCount
 * @property {any[]} calls
 * @property {any[]} returns
 * @property {Array<Error|null>} errors
 * @property {any} _returnValue
 * @property {Error|null} _throwError
 * @property {(value: any) => MockFn} mockReturnValue
 * @property {(error: Error) => MockFn} mockThrow
 * @property {() => any[]} getCalls
 * @property {() => any[]} getReturns
 * @property {() => Array<Error|null>} getErrors
 * @property {() => void} [mockRestore]
 */

/**
 * Create a mock function with call tracking.
 * @param {Function} [implementation]
 * @returns {MockFn}
 */
export const fn = implementation => {
  /** @type {MockFn} */
  const mockFn = function (/** @type {any[]} */ ...args) {
    mockFn.calls.push(args)

    if (mockFn._throwError) {
      mockFn.errors.push(/** @type {Error} */ (mockFn._throwError))
      mockFn.returns.push(undefined)
      mockFn.callCount++
      throw /** @type {Error} */ (mockFn._throwError)
    }

    const result = implementation ? implementation(...args) : mockFn._returnValue
    mockFn.returns.push(result)
    mockFn.errors.push(null)
    mockFn.callCount++

    return result
  }

  mockFn.calls = []
  mockFn.returns = []
  mockFn.errors = []
  mockFn.callCount = 0
  mockFn._returnValue = undefined
  mockFn._throwError = null

  mockFn.mockReturnValue = function (/** @type {any} */ value) {
    mockFn._returnValue = value
    mockFn._throwError = null
    return mockFn
  }

  mockFn.mockThrow = function (/** @type {Error} */ error) {
    mockFn._throwError = error
    mockFn._returnValue = undefined
    return mockFn
  }

  mockFn.getCalls = function () {
    return mockFn.calls
  }
  mockFn.getReturns = function () {
    return mockFn.returns
  }
  mockFn.getErrors = function () {
    return mockFn.errors
  }

  return mockFn
}

/**
 * Create a spy that wraps an object's method.
 * @param {Object} object
 * @param {string} methodName
 * @param {Function} [implementation]
 * @returns {MockFn & { mockRestore: () => void }}
 */
export const spy = (object, methodName, implementation) => {
  /** @type {any} */
  // @ts-ignore - dynamic property access
  const original = object[methodName]
  const mockFn = fn(implementation)

  // @ts-ignore - dynamic property assignment
  object[methodName] = mockFn

  mockFn.mockRestore = function () {
    // @ts-ignore - dynamic property assignment
    object[methodName] = original
  }

  return /** @type {MockFn & { mockRestore: () => void }} */ (mockFn)
}

export const log = {
  log: () => !env.isNodeProd(),
  warn: () => !env.isNodeProd(),
  error: () => true,
  time: () => !env.isNodeProd(),
  timeEnd: () => !env.isNodeProd(),
}
