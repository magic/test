import { is } from '../../src/index.js'
import { cleanError } from '../../src/lib/cleanError.js'
import type { TestCase } from '../../src/types.js'

type CleanErrorResult = string[] | Error

export default [
  { fn: cleanError, expect: undefined, info: 'empty argument returns argument' },
  { fn: cleanError(false), expect: false, info: '"false" as argument returns argument' },
  { fn: cleanError(true), expect: true, info: '"true" as argument returns argument' },
  { fn: cleanError(true), expect: true, info: '"true" as argument returns argument' },
  {
    fn: cleanError(new Error('testing')),
    expect: Array.isArray,
    info: 'cleaned Error returns array',
  },
  {
    fn: cleanError(new Error('testing')),
    expect: (t: CleanErrorResult) => t[0] === 'Error: testing',
    info: 'cleaned Error first element is Error: message',
  },
  {
    fn: cleanError(new Error('testing')),
    expect: (t: CleanErrorResult) => t[1]?.includes('cleanError.'),
    info: 'cleaned Error second element includes cleanError',
  },
  {
    fn: cleanError({ stack: 'testing' }),
    expect: Array.isArray,
    info: 'cleaned Error without multiline stack returns array',
  },
  {
    fn: cleanError({ stack: 'testing' }),
    expect: (t: CleanErrorResult) => is.undefined(t[1]),
    info: 'cleaned Error without multiline stack has undefined second element',
  },
  {
    fn: cleanError({ stack: 'testing' }),
    expect: (t: CleanErrorResult) => t[0] === 'testing',
    info: 'cleaned Error without multiline stack first element is testing',
  },
] satisfies TestCase[]
