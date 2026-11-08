import { isTestResult } from '#lib/stats/isTestResult.js'

export default [
  {
    fn: () =>
      isTestResult({ pass: true, result: 'x', expString: 'y', key: 'z', msg: 'a', info: 'b' }),
    expect: true,
    info: 'returns true for valid TestResult',
  },
  {
    fn: () => isTestResult({}),
    expect: false,
    info: 'returns false for empty object',
  },
  {
    fn: () => isTestResult({ pass: true }),
    expect: false,
    info: 'returns false for missing required fields',
  },
  {
    fn: () => isTestResult(null),
    expect: false,
    info: 'returns false for null',
  },
  {
    fn: () => isTestResult(undefined),
    expect: false,
    info: 'returns false for undefined',
  },
]
