import { is } from '../../src/index.mjs'
import { cleanError } from '../../src/lib/index.mjs'

export default [
  { fn: cleanError, expect: undefined, info: 'empty argument returns argument' },
  { fn: cleanError(false), expect: false, info: '"false" as argument returns argument' },
  { fn: cleanError(true), expect: true, info: '"true" as argument returns argument' },
  { fn: cleanError(true), expect: true, info: '"true" as argument returns argument' },
  {
    fn: cleanError(new Error('testing')),
    expect: t => t[0] === 'Error: testing',
    info: 'cleaned Error gets "Error: ${message}" expanded as expected',
  },
  {
    fn: cleanError(new Error('testing')),
    expect: t => t[1].includes('cleanError.'),
    info: 'cleaned Error gets first line of stack returned as cleanedError[1] expanded as expected',
  },
  {
    fn: cleanError({ stack: 'testing' }),
    expect: t => is.undefined(t[1]),
    info: 'cleaned Error without multiline stack gets returned with only one stack item',
  },
  {
    fn: cleanError({ stack: 'testing' }),
    expect: t => t[0] === 'testing',
    info: 'cleaned Error without multiline stack gets returned with correct first stack item',
  },
]
