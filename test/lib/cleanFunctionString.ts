import { cleanFunctionString } from '#lib/cleanFunctionString.js'
import type { Test } from '#src/types.js'

export default [
  // falsy values return 'false'
  {
    fn: () => cleanFunctionString(null),
    expect: 'false',
    info: 'null returns "false"',
  },
  {
    fn: () => cleanFunctionString(undefined),
    expect: 'false',
    info: 'undefined returns "false"',
  },
  {
    fn: () => cleanFunctionString(0),
    expect: 'false',
    info: '0 returns "false"',
  },
  // numbers converted to string
  {
    fn: () => cleanFunctionString(42),
    expect: '42',
    info: 'number converted to string',
  },
  // booleans converted to string
  {
    fn: () => cleanFunctionString(true),
    expect: 'true',
    info: 'boolean converted to string',
  },
  // string returned as-is (JSON.stringify of string)
  {
    fn: () => cleanFunctionString('hello'),
    expect: '"hello"',
    info: 'string handled via JSON.stringify (returns quoted)',
  },
  // simple function with t param
  {
    fn: () => cleanFunctionString((t: number) => t + 1),
    expect: 't + 1',
    info: 'function t => t + 1 cleaned to "t + 1"',
  },
  // function with (t) param
  {
    fn: () => cleanFunctionString((t: number) => t * 2),
    expect: 't * 2',
    info: 'function (t) => t * 2 cleaned to "t * 2"',
  },
  // function with () params
  {
    fn: () => cleanFunctionString(() => 42),
    expect: '42',
    info: 'function () => 42 cleaned to "42"',
  },
  // async function with await
  {
    fn: () => cleanFunctionString(async () => await Promise.resolve(1)),
    expect: 'Promise.resolve(1)',
    info: 'async () => await Promise.resolve(1) cleaned',
  },
  // async (t) function
  {
    fn: () => cleanFunctionString(async (t: number) => t + 1),
    expect: 't + 1',
    info: 'async t => t + 1 cleaned to "t + 1"',
  },
  // async (t) function with await
  {
    fn: () => cleanFunctionString(async (t: unknown) => await t),
    expect: 't',
    info: 'async (t) => await t cleaned to "t"',
  },
  // function with other params (not t) stays as-is
  {
    fn: () => cleanFunctionString((x: number, y: number) => x + y),
    expect: '(x, y) => x + y',
    info: 'function with other params not cleaned',
  },
  // object with toString
  {
    fn: () => cleanFunctionString({ toString: () => 'custom' }),
    expect: 'custom',
    info: 'object with custom toString',
  },
  // object with throwing toString falls back to JSON
  {
    fn: () => {
      const obj = {}
      Object.defineProperty(obj, 'toString', {
        value: () => {
          throw new Error('nope')
        },
      })
      return cleanFunctionString(obj)
    },
    expect: '{}',
    info: 'object with throwing toString falls back to JSON',
  },
  // plain object via JSON.stringify
  {
    fn: () => cleanFunctionString({ a: 1 }),
    expect: '[object Object]',
    info: 'plain object via toString',
  },
  // array via JSON.stringify
  {
    fn: () => cleanFunctionString([1, 2, 3]),
    expect: '1,2,3',
    info: 'array via toString',
  },
] satisfies Test[]
