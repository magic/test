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
    expect: is.string,
    info: 'stringifies a top-level function (payload-safe)',
  },
  {
    fn: () => {
      const result = makeSafeClone(function named() {})
      return result
    },
    expect: (v: unknown) => is.string(v) && v.includes('named'),
    info: 'stringifies a named function (payload-safe)',
  },
  {
    fn: () => {
      const result = makeSafeClone({ n: 2, fn: () => 1 })
      return result
    },
    expect: (v: { n: number; fn: unknown }) => v.n === 2 && is.string(v.fn),
    info: 'stringifies nested functions, keeps object structure',
  },
  {
    fn: () => {
      const result = makeSafeClone([1, () => 2, { deep: { f: function x() {} } }])
      return result
    },
    expect: (v: Array<unknown>) =>
      v.length === 3 &&
      v[0] === 1 &&
      is.string(v[1]) &&
      is.string((v[2] as { deep: { f: unknown } }).deep.f),
    info: 'stringifies functions nested in arrays and objects',
  },
  {
    fn: () => {
      const obj: { a: number; self?: object } = { a: 1, self: undefined }
      obj.self = obj
      const clone = makeSafeClone(obj) as { a: number; self?: object }
      return { clone, selfIsSelf: clone.self === clone }
    },
    expect: (v: { clone: { a: number }; selfIsSelf: boolean }) => v.clone.a === 1 && v.selfIsSelf,
    info: 'preserves circular references',
  },
  {
    fn: () => {
      // The whole point: worker postMessage payloads must be cloneable
      const payload = makeSafeClone({
        result: { fn: () => 1, ok: true },
        expect: (v: unknown) => v === true,
        error: new Error('boom'),
      })
      structuredClone(payload)
      return true
    },
    expect: true,
    info: 'output is structuredClone-safe (no DataCloneError in postMessage)',
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
  {
    fn: () => {
      const clone = makeSafeClone(
        new Map<unknown, unknown>([
          ['k', () => 1],
          [2, 'v'],
        ]),
      ) as Map<unknown, unknown>
      return { k: clone.get('k'), two: clone.get(2), size: clone.size }
    },
    expect: (v: { k: unknown; two: string; size: number }) =>
      is.string(v.k) && v.two === 'v' && v.size === 2,
    info: 'Map values are sanitized (functions stringified)',
  },
  {
    fn: () => {
      const clone = makeSafeClone(new Set([function namedF() {}, 42])) as Set<unknown>
      const strings = [...clone].filter(v => is.string(v))
      return {
        size: clone.size,
        hasNumber: clone.has(42),
        namedF: strings.some(v => String(v).includes('namedF')),
      }
    },
    expect: has.properties({ size: 2, hasNumber: true, namedF: true }),
    info: 'Set values are sanitized (functions stringified)',
  },
  {
    fn: () => {
      const clone = makeSafeClone(new ArrayBuffer(16))
      return { isAB: clone instanceof ArrayBuffer, bytes: (clone as ArrayBuffer).byteLength }
    },
    expect: (v: { isAB: boolean; bytes: number }) => v.isAB && v.bytes === 16,
    info: 'ArrayBuffer is copied, not shared',
  },
  {
    fn: () => {
      const clone = makeSafeClone(new Uint8Array([1, 2, 3]))
      return { isView: ArrayBuffer.isView(clone), copy: Array.from(clone as Uint8Array) }
    },
    expect: (v: { isView: boolean; copy: number[] }) => v.isView && v.copy.join(',') === '1,2,3',
    info: 'TypedArrays are copied via slice',
  },
  {
    fn: () => {
      // DataView has no slice() — the catch path must return the value as-is
      const view = new DataView(new ArrayBuffer(8))
      const clone = makeSafeClone(view)
      return clone === view
    },
    expect: true,
    info: 'slice-less views (DataView) fall back to the original value',
  },
  {
    fn: () => {
      class Widget {
        val = 1
        method() {
          return this.val
        }
      }
      const clone = makeSafeClone(new Widget()) as { val?: number; method?: unknown }
      return {
        isPlain: Object.getPrototypeOf(clone) === Object.prototype,
        val: clone.val,
        methodDropped: !is.function(clone.method),
      }
    },
    expect: has.properties({ isPlain: true, val: 1, methodDropped: true }),
    info: 'class instances become plain objects (prototype methods dropped)',
  },
] satisfies TestCase[]
