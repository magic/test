import { evaluateWorkerResult } from '../../../src/run/lib/evaluateWorkerResult.js'
import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: async () => evaluateWorkerResult(true, true),
    expect: { pass: true, exp: true, expString: true },
    info: 'matches boolean equality',
  },
  {
    fn: async () => evaluateWorkerResult(42, 42),
    expect: { pass: true, exp: 42, expString: 42 },
    info: 'matches number equality',
  },
  {
    fn: async () => evaluateWorkerResult('hello', 'hello'),
    expect: { pass: true, exp: 'hello', expString: 'hello' },
    info: 'matches string equality',
  },
  {
    fn: async () => evaluateWorkerResult({ a: 1 }, { a: 1 }),
    expect: { pass: true, exp: { a: 1 }, expString: { a: 1 } },
    info: 'matches object deep equality',
  },
  {
    fn: async () => evaluateWorkerResult(1, 2),
    expect: { pass: false, exp: 2, expString: 2 },
    info: 'returns false for inequality',
  },
  {
    fn: async () => evaluateWorkerResult([1, 2], [1, 2]),
    expect: { pass: true, exp: [1, 2], expString: [1, 2] },
    info: 'matches array deep equality',
  },
  {
    fn: async () => evaluateWorkerResult(null, undefined),
    expect: { pass: false, exp: undefined, expString: undefined },
    info: 'returns false for null vs undefined',
  },
  {
    fn: async () => evaluateWorkerResult(0, false),
    expect: { pass: false, exp: false, expString: false },
    info: 'returns false for 0 vs false',
  },
  {
    fn: async () => {
      const result = await evaluateWorkerResult(true, () => true)
      return result.pass === true
    },
    expect: true,
    info: 'handles function expectation returning true',
  },
  {
    fn: async () => {
      const result = await evaluateWorkerResult(42, (res: number) => res > 40)
      return result.pass === true
    },
    expect: true,
    info: 'handles function expectation with predicate',
  },
  {
    fn: async () => {
      const result = await evaluateWorkerResult(Promise.resolve(42), Promise.resolve(42))
      return result.pass === false
    },
    expect: true,
    info: 'handles promise expectation (strict equality fails)',
  },
] satisfies TestCase[]
