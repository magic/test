import is from '@magic/types'
import { isolation } from '#src/run/isolation.js'
import { has } from '#lib/has.js'
import type { TestCase } from '#src/types.js'

const re = /test/gi

export default [
  {
    name: 'isolation deepClone',
    fn: () => {
      const obj = { a: 1, b: { c: 2 } }
      const cloned = isolation.deepClone(obj)
      return { clone: cloned, original: obj }
    },
    expect: (v: { clone: { a: number; b: { c: number } }; original: object }) =>
      v.clone !== v.original && v.clone.b.c === 2,
  },
  {
    name: 'isolation deepClone with Date',
    fn: () => {
      const date = new Date('2024-01-01')
      const cloned = isolation.deepClone(date)
      return [cloned.getTime(), date.getTime()]
    },
    expect: (v: [number, number]) => v[0] === v[1],
  },
  {
    name: 'isolation deepClone with RegExp',
    fn: () => isolation.deepClone(re),
    expect: has.properties({ source: 'test', flags: 'gi' }),
  },
  {
    name: 'isolation deepClone with Set',
    fn: () => {
      const set = new Set([1, 2, 3])
      const cloned = isolation.deepClone(set)
      return [...(cloned as Set<number>)].sort()
    },
    expect: [1, 2, 3],
  },
  {
    name: 'isolation deepClone with Map',
    fn: () => {
      const map = new Map([
        ['a', 1],
        ['b', 2],
      ])
      const cloned = isolation.deepClone(map) as Map<string, number>
      return { a: cloned.get('a'), b: cloned.get('b') }
    },
    expect: { a: 1, b: 2 },
  },
  {
    name: 'isolation deepClone returns primitives',
    fn: () => isolation.deepClone(42),
    expect: 42,
  },
  {
    name: 'isolation deepClone returns null',
    fn: () => isolation.deepClone(null),
    expect: null,
  },
  {
    name: 'isolation deepClone with Symbol-keyed properties',
    fn: () => {
      const sym = Symbol('test')
      const obj = { [sym]: 'value', regular: 'prop' } as { regular: string }
      const cloned = isolation.deepClone(obj)
      return { clone: cloned, original: obj, regular: (cloned as { regular: string }).regular }
    },
    expect: [
      (v: { clone: object; original: object }) => v.clone !== v.original,
      has.properties({ regular: 'prop' }),
    ],
  },
  {
    name: 'isolation deepClone with getter/setter',
    fn: () => {
      let getterCalled = false
      const obj = {
        get value() {
          getterCalled = true
          return 42
        },
      }
      const cloned = isolation.deepClone(obj)
      const value = (cloned as typeof obj).value
      return { getterCalled, value }
    },
    expect: has.properties({ getterCalled: true, value: 42 }),
  },
  {
    name: 'isolation deepClone with non-enumerable properties',
    fn: () => {
      const obj = { visible: 1 }
      Object.defineProperty(obj, 'hidden', { value: 2, enumerable: false })
      const cloned = isolation.deepClone(obj) as typeof obj
      return { visible: cloned.visible, hasHidden: Object.hasOwn(cloned, 'hidden') }
    },
    expect: has.properties({ visible: 1, hasHidden: true }),
  },
  {
    name: 'isolation deepClone preserves prototype',
    fn: () => {
      class TestClass {
        x: number
        constructor() {
          this.x = 1
        }
        method() {
          return 2
        }
      }
      const obj = new TestClass()
      const cloned = isolation.deepClone(obj)
      return cloned.method
    },
    expect: is.function,
  },
  {
    name: 'isolation deepClone returns Error unchanged',
    fn: () => {
      const err = new Error('test error')
      const cloned = isolation.deepClone(err)
      return { clone: cloned, original: err }
    },
    expect: (v: { clone: unknown; original: Error }) => v.clone === v.original,
  },
  {
    name: 'isolation deepClone returns Function unchanged',
    fn: () => {
      const fn = function testFn() {
        return 42
      }
      const cloned = isolation.deepClone(fn)
      return { clone: cloned, original: fn }
    },
    expect: (v: { clone: unknown; original: () => number }) => v.clone === v.original,
  },
  {
    name: 'isolation deepClone handles circular reference',
    fn: () => {
      const obj: { a: number; self?: object } = { a: 1, self: undefined }
      obj.self = obj
      const cloned = isolation.deepClone(obj)
      return { clone: cloned, original: obj }
    },
    expect: (v: { clone: { a: number; self?: object }; original: object }) =>
      v.clone !== v.original && v.clone.a === 1 && v.clone.self === v.clone,
  },
  {
    name: 'isolation deepClone handles array circular reference',
    fn: () => {
      const arr: Array<number | number[]> = [1, 2]
      arr.push(arr as number[])
      const cloned = isolation.deepClone(arr)
      return { clone: cloned, original: arr }
    },
    expect: (v: { clone: Array<number | number[]>; original: Array<number | number[]> }) =>
      v.clone !== v.original && v.clone[0] === 1 && v.clone[2] === v.clone,
  },
  {
    name: 'isolation deepClone with TypedArray',
    fn: () => {
      const arr = new Uint8Array([1, 2, 3])
      const cloned = isolation.deepClone(arr)
      return Array.from(cloned as Uint8Array)
    },
    expect: [1, 2, 3],
  },
  {
    name: 'isolation deepClone with nested circular in object',
    fn: () => {
      const inner = { b: 1 }
      const outer = { a: inner, nested: inner }
      const cloned = isolation.deepClone(outer)
      return { clone: cloned, original: outer }
    },
    expect: (v: {
      clone: { a: { b: number }; nested: { b: number } }
      original: { a: { b: number }; nested: { b: number } }
    }) =>
      v.clone.a !== v.original.a &&
      v.clone.nested !== v.original.nested &&
      v.clone.a === v.clone.nested,
  },
] satisfies TestCase[]
