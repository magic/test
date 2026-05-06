import { getEffectiveWorkerLimit } from '../../../src/run/lib/getEffectiveWorkerLimit.js'
import os from 'node:os'
import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: () => {
      delete process.env.MAGIC_TEST_WORKERS
      return getEffectiveWorkerLimit()
    },
    expect: Math.max(1, os.availableParallelism() - 2),
    info: 'uses os.availableParallelism minus 2 by default',
  },
  {
    fn: () => getEffectiveWorkerLimit(4),
    expect: 4,
    info: 'uses override when provided',
  },
  {
    fn: () => getEffectiveWorkerLimit(0),
    expect: 1,
    info: 'returns 1 when override is 0',
  },
  {
    fn: () => getEffectiveWorkerLimit(-5),
    expect: 1,
    info: 'returns 1 when override is negative',
  },
  {
    fn: () => {
      process.env.MAGIC_TEST_WORKERS = '8'
      return getEffectiveWorkerLimit()
    },
    expect: 8,
    info: 'uses env var when set',
  },
  {
    fn: () => {
      process.env.MAGIC_TEST_WORKERS = '0'
      return getEffectiveWorkerLimit()
    },
    expect: 1,
    info: 'returns 1 when env var is 0',
  },
  {
    fn: () => {
      process.env.MAGIC_TEST_WORKERS = 'invalid'
      return getEffectiveWorkerLimit()
    },
    expect: Math.max(1, os.availableParallelism() - 2),
    info: 'falls back to default when env var is invalid',
  },
  {
    fn: () => {
      process.env.MAGIC_TEST_WORKERS = '3'
      return getEffectiveWorkerLimit(10)
    },
    expect: 10,
    info: 'override takes precedence over env var',
  },
] satisfies TestCase[]
