import { evaluateTestResult } from '#src/run/lib/evaluateTestResult.js'
import type { TestCase } from '#src/types.js'

export default [
  {
    fn: async () => evaluateTestResult(true, true),
    expect: { pass: true, exp: true, expString: true },
    info: 'matches boolean equality',
  },
  {
    fn: async () => evaluateTestResult(42, 42),
    expect: { pass: true, exp: 42, expString: 42 },
    info: 'matches number equality',
  },
  {
    fn: async () => evaluateTestResult('hello', 'hello'),
    expect: { pass: true, exp: 'hello', expString: 'hello' },
    info: 'matches string equality',
  },
  {
    fn: async () => evaluateTestResult({ a: 1 }, { a: 1 }),
    expect: { pass: true, exp: { a: 1 }, expString: { a: 1 } },
    info: 'matches object deep equality',
  },
  {
    fn: async () => evaluateTestResult(1, 2),
    expect: { pass: false, exp: 2, expString: 2 },
    info: 'returns false for inequality',
  },
  {
    fn: async () => evaluateTestResult([1, 2], [1, 2]),
    expect: { pass: true, exp: [1, 2], expString: [1, 2] },
    info: 'matches array deep equality',
  },
  {
    fn: async () => evaluateTestResult(null, undefined),
    expect: { pass: false, exp: undefined, expString: undefined },
    info: 'returns false for null vs undefined',
  },
  {
    fn: async () => evaluateTestResult(0, false),
    expect: { pass: false, exp: false, expString: false },
    info: 'returns false for 0 vs false',
  },
  {
    fn: async () => evaluateTestResult('', false),
    expect: { pass: false, exp: false, expString: false },
    info: 'returns false for empty string vs false',
  },
  {
    fn: async () => (await evaluateTestResult(true, () => true)).pass,
    expect: true,
    info: 'handles function expectation returning true',
  },
  {
    fn: async () => (await evaluateTestResult(false, () => false)).pass,
    expect: true,
    info: 'handles function expectation returning false (pass is true due to exp===res)',
  },
  {
    fn: async () => (await evaluateTestResult(42, (res: number) => res > 40)).pass,
    expect: true,
    info: 'handles function expectation with predicate',
  },
  {
    fn: async () => (await evaluateTestResult(42, (res: number) => res > 50)).pass,
    expect: false,
    info: 'handles function expectation returning false for wrong value',
  },
  {
    fn: async () => (await evaluateTestResult(Promise.resolve(42), Promise.resolve(42))).pass,
    expect: false,
    info: 'handles promise expectation (strict equality fails)',
  },
] satisfies TestCase[]
