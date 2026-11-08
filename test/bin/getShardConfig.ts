import { getShardConfig, handleError } from '#src/bin/unit.js'
import type { TestCase } from '#src/types.js'

// getShardConfig reads process.env; tests in a file run in parallel, so
// serialize env mutation with a promise-chain lock.
let chain: Promise<unknown> = Promise.resolve()
const lock = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = chain.then(fn)
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

const ENV_KEYS = [
  'MAGIC_TEST_SHARDING_SHARDS',
  'MAGIC_TEST_SHARDING_ID',
  'MAGIC_TEST_WORKERS',
] as const

const withEnv = (values: Partial<Record<(typeof ENV_KEYS)[number], string>>, fn: () => unknown) =>
  lock(async () => {
    const saved: Record<string, string | undefined> = {}
    for (const key of ENV_KEYS) {
      saved[key] = process.env[key]
      delete process.env[key]
    }
    for (const [key, value] of Object.entries(values)) {
      process.env[key] = value
    }
    try {
      return fn()
    } finally {
      for (const key of ENV_KEYS) {
        if (saved[key] === undefined) {
          delete process.env[key]
        } else {
          process.env[key] = saved[key]
        }
      }
    }
  })

const runHandleError = (input: Error | string) => {
  const originalExit = process.exit
  let exitCode: unknown
  process.exit = ((code: unknown) => {
    exitCode = code
    throw new Error('__magic_exit__')
  }) as typeof process.exit
  try {
    try {
      handleError(input)
      return { threw: false, exitCode }
    } catch (e) {
      return { threw: (e as Error).message === '__magic_exit__', exitCode }
    }
  } finally {
    process.exit = originalExit
  }
}

export default [
  {
    fn: () => withEnv({}, () => getShardConfig()),
    expect: { shards: 1, shardId: 0, workers: undefined },
    info: 'getShardConfig defaults: 1 shard, id 0, no worker cap',
  },
  {
    fn: () =>
      withEnv(
        {
          MAGIC_TEST_SHARDING_SHARDS: '4',
          MAGIC_TEST_SHARDING_ID: '2',
          MAGIC_TEST_WORKERS: '8',
        },
        () => getShardConfig(),
      ),
    expect: { shards: 4, shardId: 2, workers: 8 },
    info: 'getShardConfig parses valid shards/id/workers',
  },
  {
    fn: () => withEnv({ MAGIC_TEST_SHARDING_SHARDS: 'not-a-number' }, () => getShardConfig()),
    expect: (v: { shards: number; shardId: number }) => v.shards === 1 && v.shardId === 0,
    info: 'getShardConfig falls back to 1 shard on invalid shards value',
  },
  {
    fn: () => withEnv({ MAGIC_TEST_SHARDING_ID: 'not-a-number' }, () => getShardConfig()),
    expect: (v: { shards: number; shardId: number }) => v.shards === 1 && v.shardId === 0,
    info: 'getShardConfig falls back to shard 0 on invalid id value',
  },
  {
    fn: () =>
      withEnv({ MAGIC_TEST_SHARDING_SHARDS: '0', MAGIC_TEST_SHARDING_ID: '-3' }, () =>
        getShardConfig(),
      ),
    expect: (v: { shards: number; shardId: number }) => v.shards === 1 && v.shardId === 0,
    info: 'getShardConfig clamps shards to >=1 and shard id to >=0',
  },
  {
    fn: () => withEnv({ MAGIC_TEST_WORKERS: '0' }, () => getShardConfig()),
    expect: (v: { workers: number | undefined }) => v.workers === 1,
    info: 'getShardConfig clamps workers to >=1',
  },
  {
    fn: () => withEnv({ MAGIC_TEST_WORKERS: 'garbage' }, () => getShardConfig()),
    expect: (v: { workers: number | undefined }) =>
      v.workers !== undefined && Number.isNaN(v.workers as number),
    info: 'getShardConfig documents current behavior: non-numeric workers yields NaN',
  },
  {
    fn: () => runHandleError('simulated CLI failure: string input'),
    expect: { threw: true, exitCode: 1 },
    info: 'handleError(string) logs and exits 1',
  },
  {
    fn: () => runHandleError(new Error('simulated CLI failure: Error input')),
    expect: { threw: true, exitCode: 1 },
    info: 'handleError(Error) logs and exits 1',
  },
] satisfies TestCase[]
