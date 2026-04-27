import { isTestResult } from '../../../src/lib/stats/isTestResult.js'

export default [
  {
    fn: () =>
      isTestResult({ pass: true, result: 'x', expString: 'y', key: 'z', msg: 'a', info: 'b' }) ===
      true,
    expect: true,
    info: 'returns true for valid TestResult',
  },
  {
    fn: () => isTestResult({}) === false,
    expect: true,
    info: 'returns false for empty object',
  },
  {
    fn: () => isTestResult({ pass: true }) === false,
    expect: true,
    info: 'returns false for missing required fields',
  },
  {
    fn: () => isTestResult(null) === false,
    expect: true,
    info: 'returns false for null',
  },
  {
    fn: () => isTestResult(undefined) === false,
    expect: true,
    info: 'returns false for undefined',
  },
]
