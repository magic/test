import { makeSafeClone } from '../../../src/run/lib/makeSafeClone.js'
import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: () => makeSafeClone(null),
    expect: null,
    info: 'returns null as-is',
  },
  {
    fn: () => makeSafeClone(undefined),
    expect: undefined,
    info: 'returns undefined as-is',
  },
  {
    fn: () => makeSafeClone(42),
    expect: 42,
    info: 'returns number as-is',
  },
  {
    fn: () => makeSafeClone('string'),
    expect: 'string',
    info: 'returns string as-is',
  },
  {
    fn: () => makeSafeClone(true),
    expect: true,
    info: 'returns boolean as-is',
  },
  {
    fn: () => {
      const bigIntValue = BigInt(123)
      return makeSafeClone(bigIntValue) === bigIntValue
    },
    expect: true,
    info: 'returns BigInt as-is',
  },
  {
    fn: () => {
      const sym = Symbol('test')
      return makeSafeClone(sym) === sym
    },
    expect: true,
    info: 'returns Symbol as-is',
  },
  {
    fn: () => makeSafeClone({ a: 1 }),
    expect: { a: 1 },
    info: 'returns cloneable object as-is',
  },
  {
    fn: () => makeSafeClone([1, 2, 3]),
    expect: [1, 2, 3],
    info: 'returns array as-is',
  },
  {
    fn: () => {
      const result = makeSafeClone(() => {})
      return typeof result === 'function'
    },
    expect: true,
    info: 'returns function as-is for non-isolated fn',
  },
  {
    fn: () => {
      const result = makeSafeClone(function named() {})
      return typeof result === 'function'
    },
    expect: true,
    info: 'returns function as-is for named function',
  },
  {
    fn: () => {
      const result = makeSafeClone(Symbol.iterator)
      return typeof result === 'symbol'
    },
    expect: true,
    info: 'returns symbol as-is for well-known symbol',
  },
  {
    fn: () => {
      const err = new Error('test error')
      return typeof makeSafeClone(err) === 'object' || typeof makeSafeClone(err) === 'string'
    },
    expect: true,
    info: 'handles Error objects',
  },
] satisfies TestCase[]
