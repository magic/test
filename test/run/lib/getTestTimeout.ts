import { getTestTimeout } from '../../../src/run/lib/getTestTimeout.js'
import { DEFAULT_TEST_TIMEOUT } from '../../../src/constants.js'
import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: () => getTestTimeout(undefined),
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when no args or env',
  },
  {
    fn: () => getTestTimeout(5000),
    expect: 5000,
    info: 'returns per-test timeout when positive',
  },
  {
    fn: () => getTestTimeout(0),
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when timeout is 0',
  },
  {
    fn: () => getTestTimeout(-100),
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when timeout is negative',
  },
  {
    fn: () => {
      process.env.MAGIC_TEST_TIMEOUT = '30000'
      return getTestTimeout(undefined)
    },
    expect: 30000,
    info: 'uses env var when no per-test timeout',
  },
  {
    fn: () => {
      process.env.MAGIC_TEST_TIMEOUT = '30000'
      return getTestTimeout(5000)
    },
    expect: 5000,
    info: 'per-test timeout takes precedence over env',
  },
  {
    fn: () => {
      process.env.MAGIC_TEST_TIMEOUT = 'not-a-number'
      return getTestTimeout(undefined)
    },
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when env var is invalid',
  },
  {
    fn: () => {
      delete process.env.MAGIC_TEST_TIMEOUT
      return getTestTimeout(undefined)
    },
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when env var is empty',
  },
] satisfies TestCase[]
