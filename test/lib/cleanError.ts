import { cleanError } from '../../src/lib/cleanError.js'
import type { TestCase } from '../../src/types.js'
import { has } from '../../src/lib/has.js'

export default [
  // @ts-expect-error - testing calling cleanError with no arguments
  { fn: () => cleanError(), expect: undefined, info: 'empty argument returns argument' },
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
    expect: has.at(0, 'Error: testing'),
    info: 'cleaned Error first element is Error: message',
  },
  {
    fn: cleanError(new Error('testing')),
    expect: has.at(1, has.string('cleanError.')),
    info: 'cleaned Error second element includes cleanError',
  },
  {
    fn: cleanError({ stack: 'testing' }),
    expect: Array.isArray,
    info: 'cleaned Error without multiline stack returns array',
  },
  {
    fn: cleanError({ stack: 'testing' }),
    expect: has.at(1, undefined),
    info: 'cleaned Error without multiline stack has undefined second element',
  },
  {
    fn: cleanError({ stack: 'testing' }),
    expect: has.at(0, 'testing'),
    info: 'cleaned Error without multiline stack first element is testing',
  },
  {
    fn: cleanError({ stack: '' }),
    expect: { stack: '' },
    info: 'cleaned Error with empty stack string returns input object unchanged',
  },
  {
    fn: cleanError({ stack: 'only one line' }),
    expect: ['only one line'],
    info: 'cleaned Error with single-line stack returns single element array',
  },
  {
    fn: cleanError({ stack: 'line1\n  line2' }),
    expect: ['line1', '  line2'],
    info: 'cleaned Error splits stack, only removes exactly 4 leading spaces',
  },
  {
    fn: cleanError({ stack: 'line1\n    ' }),
    expect: ['line1', ''],
    info: 'cleaned Error with only spaces after newline returns empty file part',
  },
  {
    fn: cleanError({ stack: null }),
    expect: { stack: null },
    info: 'null stack returns input object (null is falsy but object exists)',
  },
  {
    fn: cleanError({ stack: undefined }),
    expect: { stack: undefined },
    info: 'undefined stack returns input object',
  },
] satisfies TestCase[]
