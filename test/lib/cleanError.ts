import { cleanError } from '../../src/lib/cleanError.js'
import type { TestCase } from '../../src/types.js'

export default [
  // Non-object returns as-is
  {
    fn: () => cleanError('string error'),
    expect: 'string error',
    info: 'returns string as-is',
  },
  {
    fn: () => cleanError(42),
    expect: 42,
    info: 'returns number as-is',
  },
  {
    fn: () => cleanError(null),
    expect: null,
    info: 'returns null as-is',
  },
  {
    fn: () => cleanError(undefined),
    expect: undefined,
    info: 'returns undefined as-is',
  },
  // Object without stack
  {
    fn: () => cleanError({}),
    expect: {},
    info: 'returns plain object as-is',
  },
  // Object with non-string stack
  {
    fn: () => cleanError({ stack: 123 }),
    expect: { stack: 123 },
    info: 'returns object with non-string stack as-is',
  },
  // Standard error with file in stack
  {
    fn: () => {
      const err = new Error('test error')
      return cleanError(err)
    },
    expect: (result: unknown) => Array.isArray(result) && result.length >= 1,
    info: 'returns array for standard error',
  },
  // Error with stack but no file part (uncovered branch line 20)
  {
    fn: () => {
      const err = { stack: 'Error: only message' }
      return cleanError(err)
    },
    expect: ['Error: only message'],
    info: 'error with stack but no file part returns message only',
  },
  // Error with stack containing file with unusual spacing (line 23)
  {
    fn: () => {
      const err = { stack: 'Error: msg\n    file.js:10' }
      const result = cleanError(err)
      return Array.isArray(result) && result.length === 2
    },
    expect: true,
    info: 'handles unusual spacing in stack',
  },
  // Error with multiple lines in stack
  {
    fn: () => {
      const err = new Error('multi\nline\nerror')
      return cleanError(err)
    },
    expect: (result: unknown) => Array.isArray(result),
    info: 'handles multiline error message',
  },
  // Error with empty message
  {
    fn: () => {
      const err = new Error('')
      return cleanError(err)
    },
    expect: (result: unknown) => Array.isArray(result),
    info: 'handles empty error message',
  },
  // Object with empty string stack returns object (not array)
  {
    fn: () => {
      const err = { stack: '' }
      const result = cleanError(err)
      return typeof result === 'object' && !Array.isArray(result)
    },
    expect: true,
    info: 'returns object as-is when stack is empty string',
  },
  // Object with only file in stack (no message)
  {
    fn: () => {
      const err = { stack: '\n    at Object.<anonymous> (/path/file.js:1:1)' }
      return cleanError(err)
    },
    expect: (result: unknown) => Array.isArray(result),
    info: 'handles stack with only file location',
  },
] satisfies TestCase[]
