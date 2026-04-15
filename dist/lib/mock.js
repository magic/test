import { env } from './env.js'
/**
 * Create a mock function with call tracking.
 */
export const fn = implementation => {
  const mockFn = (...args) => {
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
  mockFn.calls = []
  mockFn.returns = []
  mockFn.errors = []
  mockFn.callCount = 0
  mockFn._returnValue = undefined
  mockFn._throwError = null
  mockFn.mockReturnValue = function (value) {
    mockFn._returnValue = value
    mockFn._throwError = null
    return mockFn
  }
  mockFn.mockThrow = function (error) {
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
 */
export const spy = (obj, methodName, implementation) => {
  const original = obj[methodName]
  const mockFn = fn(implementation)
  obj[methodName] = mockFn
  mockFn.mockRestore = () => {
    obj[methodName] = original
  }
  return mockFn
}
export const log = {
  log: (..._) => !env.isNodeProd(),
  warn: (..._) => !env.isNodeProd(),
  error: (..._) => true,
  time: (..._) => !env.isNodeProd(),
  timeEnd: (..._) => !env.isNodeProd(),
}
