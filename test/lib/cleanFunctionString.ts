import { cleanFunctionString } from '../../src/lib/cleanFunctionString.js'
import type { TestCase } from '../../src/types.js'

export default [
  // Falsy values
  {
    fn: () => cleanFunctionString(null),
    expect: 'false',
    info: 'returns false for null',
  },
  {
    fn: () => cleanFunctionString(undefined),
    expect: 'false',
    info: 'returns false for undefined',
  },
  {
    fn: () => cleanFunctionString(0),
    expect: 'false',
    info: 'returns false for 0 (falsy)',
  },
  {
    fn: () => cleanFunctionString(false),
    expect: 'false',
    info: 'returns false for false',
  },
  // Numbers and booleans
  {
    fn: () => cleanFunctionString(42),
    expect: '42',
    info: 'returns "42" for number 42',
  },
  {
    fn: () => cleanFunctionString(true),
    expect: 'true',
    info: 'returns "true" for true',
  },
  // Objects without toString method
  {
    fn: () => cleanFunctionString(Object.create(null)),
    expect: '{}',
    info: 'returns {} for object without toString',
  },
  // Object with custom toString that throws
  {
    fn: () => {
      const obj = {
        get toString() {
          throw new Error('toString failed')
        },
      }
      try {
        cleanFunctionString(obj)
        return false
      } catch (e) {
        return e instanceof Error && e.message === 'toString failed'
      }
    },
    expect: true,
    info: 'throws when toString throws (error propagates)',
  },
  // Objects with custom toString
  {
    fn: () => cleanFunctionString({ toString: () => 'custom string' }),
    expect: 'custom string',
    info: 'uses custom toString when available',
  },
  // Regular function
  {
    fn: () =>
      cleanFunctionString(function () {
        return 1
      }),
    expect: (s: string) => s.includes('return 1'),
    info: 'handles regular function',
  },
  // Named function
  {
    fn: () => cleanFunctionString(function testFn() {}),
    expect: (s: string) => s.includes('testFn'),
    info: 'handles named function',
  },
  // Array (uses toString, not JSON.stringify)
  {
    fn: () => cleanFunctionString([1, 2, 3]),
    expect: '1,2,3',
    info: 'uses toString for array',
  },
  // Object (uses toString, not JSON.stringify)
  {
    fn: () => cleanFunctionString({ a: 1 }),
    expect: '[object Object]',
    info: 'uses toString for object',
  },
] satisfies TestCase[]
