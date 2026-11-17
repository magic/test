import { getTestTimeout } from '#src/run/lib/getTestTimeout.js'
import { DEFAULT_TEST_TIMEOUT } from '#src/constants.js'
import type { TestCase } from '#src/types.js'

/**
 * Run fn with MAGIC_TEST_TIMEOUT set to value (undefined = deleted), then
 * restore the ambient value. The runner's getTestTimeout reads the ambient
 * env, and this file runs in the same process as every other main-thread
 * test — a leaked mutation (especially a delete, which removes a value the
 * parent runner may have set) would silently downgrade later tests to the
 * stock default.
 */
const withEnv = (value: string | undefined, fn: () => number): number => {
  const original = process.env.MAGIC_TEST_TIMEOUT
  if (value === undefined) {
    delete process.env.MAGIC_TEST_TIMEOUT
  } else {
    process.env.MAGIC_TEST_TIMEOUT = value
  }
  try {
    return fn()
  } finally {
    if (original === undefined) {
      delete process.env.MAGIC_TEST_TIMEOUT
    } else {
      process.env.MAGIC_TEST_TIMEOUT = original
    }
  }
}

export default [
  {
    fn: () => withEnv(undefined, () => getTestTimeout(undefined)),
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when no args or env',
  },
  {
    fn: () => withEnv(undefined, () => getTestTimeout(5000)),
    expect: 5000,
    info: 'returns per-test timeout when positive',
  },
  {
    fn: () => withEnv(undefined, () => getTestTimeout(0)),
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when timeout is 0',
  },
  {
    fn: () => withEnv(undefined, () => getTestTimeout(-100)),
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when timeout is negative',
  },
  {
    fn: () => withEnv('30000', () => getTestTimeout(undefined)),
    expect: 30000,
    info: 'uses env var when no per-test timeout',
  },
  {
    fn: () => withEnv('30000', () => getTestTimeout(5000)),
    expect: 5000,
    info: 'per-test timeout takes precedence over env',
  },
  {
    fn: () => withEnv('not-a-number', () => getTestTimeout(undefined)),
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when env var is invalid',
  },
  {
    fn: () => withEnv(undefined, () => getTestTimeout(undefined)),
    expect: DEFAULT_TEST_TIMEOUT,
    info: 'returns default when env var is empty',
  },
  {
    fn: () => {
      // the ambient value (set by the runner, e.g. the busy-machine bump)
      // must survive the whole suite untouched
      const original = process.env.MAGIC_TEST_TIMEOUT
      const after = withEnv('42', () => 1)
      return { after, restored: process.env.MAGIC_TEST_TIMEOUT === original }
    },
    expect: (v: { after: number; restored: boolean }) => v.after === 1 && v.restored,
    info: 'withEnv restores the ambient MAGIC_TEST_TIMEOUT',
  },
] satisfies TestCase[]
