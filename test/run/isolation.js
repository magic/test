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
]
