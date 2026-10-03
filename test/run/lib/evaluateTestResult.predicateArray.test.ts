import is from '@magic/types'
import { evaluateTestResult } from '#src/run/lib/evaluateTestResult.js'
import type { TestCase } from '#src/types.js'

export default [
  {
    fn: async () => {
      const r = await evaluateTestResult('123', [is.string, '123'])
      return r.pass
    },
    expect: true,
    info: 'predicate + value: all pass',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult('123', [is.string, 'wrong'])
      return r.pass
    },
    expect: false,
    info: 'predicate + value: value mismatch fails',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult(123, [is.string, '123'])
      return r.pass
    },
    expect: false,
    info: 'predicate + value: type predicate fails',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult([1, 2, 3], [is.array, [1, 2, 3]])
      return r.pass
    },
    expect: true,
    info: 'predicate: is.array + value match',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult(42, [is.number, (v: number) => v > 0, 42])
      return r.pass
    },
    expect: true,
    info: 'mixed predicates + value: all pass',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult('-5', [is.number, (v: number) => v > 0, -5])
      return r.pass
    },
    expect: false,
    info: 'mixed: predicate fails',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult([1, 2, 3], [1, 2, 3])
      return r.pass
    },
    expect: true,
    info: 'pure value array: backward compat pass',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult([1, 2, 3], [1, 2, 4])
      return r.pass
    },
    expect: false,
    info: 'pure value array: backward compat fail',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult(null, [is.null, null])
      return r.pass
    },
    expect: true,
    info: 'predicate array: null',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult(undefined, [is.undefined, undefined])
      return r.pass
    },
    expect: true,
    info: 'predicate array: undefined',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult('anything', [])
      return r.exp
    },
    expect: [],
    info: 'empty array: falls through to deep.equal',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult({ a: 1 }, { a: 1 })
      return r.pass
    },
    expect: true,
    info: 'backward compat: plain object still works',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult({ a: 1 }, [is.object, { a: 1 }])
      return r.pass
    },
    expect: true,
    info: 'predicate + object value: match',
  },
  {
    fn: async () => {
      const r = await evaluateTestResult({ a: 2 }, [is.object, { a: 1 }])
      return r.pass
    },
    expect: false,
    info: 'predicate + object value: mismatch',
  },
] satisfies TestCase[]
