import is from '@magic/types'
import { makeSafeClone } from '#src/run/lib/makeSafeClone.js'
import { has } from '#lib/has.js'
import type { TestCase } from '#src/types.js'

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
      return { clone: makeSafeClone(bigIntValue), original: bigIntValue }
    },
    expect: (v: { clone: unknown; original: bigint }) => v.clone === v.original,
    info: 'returns BigInt as-is',
  },
  {
    fn: () => {
      const sym = Symbol('test')
      return { clone: makeSafeClone(sym), original: sym }
    },
    expect: (v: { clone: unknown; original: symbol }) => v.clone === v.original,
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
      return result
    },
    expect: is.function,
    info: 'returns function as-is for non-isolated fn',
  },
  {
    fn: () => {
      const result = makeSafeClone(function named() {})
      return result
    },
    expect: is.function,
    info: 'returns function as-is for named function',
  },
  {
    fn: () => {
      const result = makeSafeClone(Symbol.iterator)
      return result
    },
    expect: is.symbol,
    info: 'returns symbol as-is for well-known symbol',
  },
  {
    fn: () => {
      const err = new Error('test error')
      const clone = makeSafeClone(err)
      return clone
    },
    expect: (v: unknown) => is.object(v) || is.string(v),
    info: 'handles Error objects',
  },
  // Error path tests - trigger structuredClone failure and fallback
  {
    fn: () => {
      // Create a proxy that throws on clone attempt
      const handler = {
        get(target: unknown, prop: string) {
          if (prop === 'toJSON') {
            throw new Error('clone not allowed')
          }
          return (target as Record<string, unknown>)[prop]
        },
      }
      const obj = new Proxy({ a: 1 }, handler)
      // This should trigger the error path and fallback to JSON.stringify or String
      const result = makeSafeClone(obj)
      return result
    },
    expect: (v: unknown) => is.string(v) || is.object(v),
    info: 'handles objects that fail structuredClone (line 15-16 path)',
  },
  {
    fn: () => {
      // Object with symbol key that might fail JSON.stringify but pass structuredClone
      const sym = Symbol('test')
      const obj = { [sym]: 'value' }
      // This should either clone successfully or fall back gracefully
      const result = makeSafeClone(obj)
      return result
    },
    expect: (v: unknown) => is.string(v) || is.object(v),
    info: 'handles objects with symbol keys',
  },
  {
    fn: () => {
      // Object that can be cloned by structuredClone
      const obj = { nested: { value: 42 }, arr: [1, 2, 3] }
      const result = makeSafeClone(obj)
      return result
    },
    expect: { nested: { value: 42 }, arr: [1, 2, 3] },
    info: 'deeply nested objects are cloned correctly',
  },
  {
    fn: () => {
      // Object with undefined values
      const obj = { a: undefined, b: null, c: 1 }
      const result = makeSafeClone(obj)
      return result
    },
    expect: has.properties({ a: undefined, b: null, c: 1 }),
    info: 'handles undefined and null values',
  },
] satisfies TestCase[]
