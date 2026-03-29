import { isolation } from '../../src/run/isolation.js'

export default [
  {
    name: 'isolation deepClone',
    fn: () => {
      const obj = { a: 1, b: { c: 2 } }
      const cloned = isolation.deepClone(obj)
      return obj !== cloned && cloned.b.c === 2
    },
    expect: true,
  },
  {
    name: 'isolation deepClone with Date',
    fn: () => {
      const date = new Date('2024-01-01')
      const cloned = isolation.deepClone(date)
      return cloned.getTime() === date.getTime()
    },
    expect: true,
  },
  {
    name: 'isolation deepClone with RegExp',
    fn: () => {
      const re = /test/gi
      const cloned = isolation.deepClone(re)
      return cloned.source === re.source && cloned.flags === re.flags
    },
    expect: true,
  },
  {
    name: 'isolation deepClone with Set',
    fn: () => {
      const set = new Set([1, 2, 3])
      const cloned = isolation.deepClone(set)
      return cloned.has(1) && cloned.has(2) && cloned.has(3)
    },
    expect: true,
  },
  {
    name: 'isolation deepClone with Map',
    fn: () => {
      const map = new Map([
        ['a', 1],
        ['b', 2],
      ])
      const cloned = isolation.deepClone(map)
      return cloned.get('a') === 1 && cloned.get('b') === 2
    },
    expect: true,
  },
  {
    name: 'isolation deepClone returns primitives',
    fn: () => {
      return isolation.deepClone(42) === 42
    },
    expect: true,
  },
  {
    name: 'isolation deepClone returns null',
    fn: () => {
      return isolation.deepClone(null) === null
    },
    expect: true,
  },
  {
    name: 'isolation deepClone with Symbol-keyed properties',
    fn: () => {
      const sym = Symbol('test')
      const obj = { [sym]: 'value', regular: 'prop' }
      const cloned = isolation.deepClone(obj)
      return obj !== cloned && cloned.regular === 'prop'
    },
    expect: true,
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
      const result = cloned.value
      return getterCalled && result === 42
    },
    expect: true,
  },
  {
    name: 'isolation deepClone with non-enumerable properties',
    fn: () => {
      const obj = { visible: 1 }
      Object.defineProperty(obj, 'hidden', { value: 2, enumerable: false })
      const cloned = isolation.deepClone(obj)
      return cloned.visible === 1 && Object.hasOwn(cloned, 'hidden')
    },
    expect: true,
  },
  {
    name: 'isolation deepClone preserves prototype',
    fn: () => {
      class TestClass {
        constructor() {
          this.x = 1
        }
        method() {
          return 2
        }
      }
      const obj = new TestClass()
      const cloned = isolation.deepClone(obj)
      return cloned.x === 1 && typeof cloned.method === 'function'
    },
    expect: true,
  },
  {
    name: 'isolation deepClone returns Error unchanged',
    fn: () => {
      const err = new Error('test error')
      const cloned = isolation.deepClone(err)
      return cloned === err
    },
    expect: true,
  },
  {
    name: 'isolation deepClone returns Function unchanged',
    fn: () => {
      const fn = function testFn() {
        return 42
      }
      const cloned = isolation.deepClone(fn)
      return cloned === fn
    },
    expect: true,
  },
  {
    name: 'isolation deepClone handles circular reference',
    fn: () => {
      const obj = { a: 1 }
      obj.self = obj
      const cloned = isolation.deepClone(obj)
      return cloned !== obj && cloned.a === 1 && cloned.self === cloned
    },
    expect: true,
  },
  {
    name: 'isolation deepClone handles array circular reference',
    fn: () => {
      const arr = [1, 2]
      arr.push(arr)
      const cloned = isolation.deepClone(arr)
      return cloned !== arr && cloned[0] === 1 && cloned[2] === cloned
    },
    expect: true,
  },
  {
    name: 'isolation deepClone with TypedArray',
    fn: () => {
      const arr = new Uint8Array([1, 2, 3])
      const cloned = isolation.deepClone(arr)
      return cloned.length === 3 && cloned[0] === 1 && cloned[1] === 2 && cloned[2] === 3
    },
    expect: true,
  },
  {
    name: 'isolation deepClone with nested circular in object',
    fn: () => {
      const inner = { b: 1 }
      const outer = { a: inner, nested: inner }
      const cloned = isolation.deepClone(outer)
      return cloned.a !== outer.a && cloned.nested !== outer.nested && cloned.a === cloned.nested
    },
    expect: true,
  },
]
