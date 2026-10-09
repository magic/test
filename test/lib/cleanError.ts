import { cleanError } from '#lib/cleanError.js'
import type { Test } from '#src/types.js'
import is from '@magic/types'

export default [
  // cleanError with null
  {
    fn: () => cleanError(null),
    expect: null,
    info: 'cleanError(null) returns null',
  },
  // cleanError with undefined
  {
    fn: () => cleanError(undefined),
    expect: undefined,
    info: 'cleanError(undefined) returns undefined',
  },
  // cleanError with non-object
  {
    fn: () => cleanError(42),
    expect: 42,
    info: 'cleanError(42) returns 42',
  },
  // cleanError with string
  {
    fn: () => cleanError('not an error'),
    expect: 'not an error',
    info: 'cleanError("not an error") returns string',
  },
  // cleanError with object without stack
  {
    fn: () => cleanError({}),
    expect: is.not.undefined,
    info: 'cleanError({}) does not return undefined',
  },
  {
    fn: () => cleanError({}),
    expect: is.not.null,
    info: 'cleanError({}) does not return null',
  },
  {
    fn: () => cleanError({}),
    expect: is.objectNative,
    info: 'cleanError({}) returns an object',
  },
  // cleanError with object with numeric stack
  {
    fn: () => cleanError({ stack: 123 }),
    expect: is.not.undefined,
    info: 'cleanError({ stack: 123 }) does not return undefined',
  },
  {
    fn: () => cleanError({ stack: 123 }),
    expect: is.not.null,
    info: 'cleanError({ stack: 123 }) does not return null',
  },

  {
    fn: () => cleanError({ stack: 123 }),
    expect: is.objectNative,
    info: 'cleanError({ stack: 123 }) returns an object',
  },
  // cleanError with empty stack string (falsy, returns original object)
  {
    fn: () => {
      const original = { stack: '' }
      return cleanError(original) === original
    },
    expect: true,
    info: 'cleanError({ stack: "" }) returns original object (empty stack is falsy)',
  },
  // cleanError with simple stack (no newline)
  {
    fn: () => cleanError({ stack: 'Error: boom' }),
    expect: ['Error: boom'],
    info: 'cleanError({ stack: "Error: boom" }) returns ["Error: boom"]',
  },
  // cleanError with stack containing newline
  {
    fn: () => cleanError({ stack: 'Error: boom\n    at module.js:10:5' }),
    expect: ['Error: boom', 'at module.js:10:5'],
    info: 'cleanError with multi-line stack returns [err, file]',
  },
  // cleanError with stack where first line is empty
  {
    fn: () => cleanError({ stack: '\n    at module.js:10:5' }),
    expect: ['', 'at module.js:10:5'],
    info: 'cleanError with empty first line returns ["", "at module.js:10:5"]',
  },
  // cleanError with real Error object
  {
    fn: () => {
      const result = cleanError(new Error('test error'))
      return Array.isArray(result) && result[0] === 'Error: test error'
    },
    expect: true,
    info: 'cleanError(new Error(...)) returns array with error message',
  },
  // cleanError with Error object containing stack trace
  {
    fn: () => {
      const err = new Error('deep error')
      err.stack = 'Error: deep error\n    at cleanError.ts:5:10\n    at module.ts:10:20'
      const result = cleanError(err)
      return Array.isArray(result) && result.length === 2
    },
    expect: true,
    info: 'cleanError with Error having stack trace returns 2-element array',
  },
  // cleanError with Error object with empty stack
  {
    fn: () => {
      const err = new Error('no stack')
      err.stack = ''
      return cleanError(err) === err
    },
    expect: true,
    info: 'cleanError with empty stack returns original Error object',
  },
  // cleanError with Error having no stack property
  {
    fn: () => {
      const err = new Error('no stack property')
      delete err.stack
      return cleanError(err) === err
    },
    expect: true,
    info: 'cleanError with no stack property returns original',
  },
] satisfies Test[]
