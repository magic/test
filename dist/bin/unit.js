#!/usr/bin/env node
// Register TypeScript loader before other imports
import './lib/registerLoader.js'
import log from '@magic/log'
import is from '@magic/types'
import { run, abort } from '../run.js'
import { maybeInjectMagic, readRecursive, resetVisitedDirs } from './lib/index.js'
// Create globalStartTime BEFORE anything else for accurate total timing
const globalStartTime = log.hrtime()
const getShardConfig = () => {
  const rawShards = process.env.MAGIC_TEST_SHARDING_SHARDS
  const rawShardId = process.env.MAGIC_TEST_SHARDING_ID
  const rawWorkers = process.env.MAGIC_TEST_WORKERS
  const shards = Math.max(1, parseInt(rawShards || '1', 10)) || 1
  const shardId = Math.max(0, parseInt(rawShardId || '0', 10)) || 0
  const workers = rawWorkers ? Math.max(1, parseInt(rawWorkers, 10)) : undefined
  if (rawShards && isNaN(parseInt(rawShards, 10))) {
    log.warn(`Invalid MAGIC_TEST_SHARDING_SHARDS: ${rawShards}, using default: 1`)
  }
  if (rawShardId && isNaN(parseInt(rawShardId, 10))) {
    log.warn(`Invalid MAGIC_TEST_SHARDING_ID: ${rawShardId}, using default: 0`)
  }
  return { shards, shardId, workers }
}
const init = async () => {
  try {
    await maybeInjectMagic()
    // Reset state between runs to prevent stale cache issues
    resetVisitedDirs()
    // Progress tracking for test collection
    let testFileCount = 0
    const tests = await readRecursive('', count => {
      if (count > testFileCount) {
        testFileCount = count
        process.stdout.write(`\rCollecting tests: ${count} files processed`)
      }
    })
    // Clear the progress line
    process.stdout.write('\r' + ' '.repeat(50) + '\r')
    if (tests) {
      // Count total tests
      const countTests = obj => {
        if (is.array(obj)) {
          return obj.length
        }
        if (is.objectNative(obj)) {
          return Object.values(obj).reduce((sum, val) => sum + countTests(val), 0)
        }
        return 0
      }
      const totalTests = countTests(tests)
      log.annotate(`Found ${totalTests} tests across ${testFileCount} files\n`)
    }
    if (!tests) {
      log.error('NO tests specified')
      return
    }
    const { shards, shardId, workers } = getShardConfig()
    await run(tests, { shards, shardId, workers, globalStartTime })
  } catch (e) {
    const err = e
    err.code = 'E_MAGIC_TEST'
    log.error(err)
    process.exit(1)
  }
}
init()
const handleError = error => {
  if (is.string(error)) {
    error = new Error(error)
  }
  log.error(error.name, error.message)
  if (error.stack) {
    const stack = error.stack.replace(error.name, '').replace(error.message, '')
    log.warn('stacktrace', stack)
  }
  process.exit(1)
}
process.on('unhandledRejection', handleError).on('uncaughtException', handleError)
const shutdown = async () => {
  log.warn('Received shutdown signal, aborting tests...')
  await abort()
  process.exit(1)
}
process.on('SIGTERM', shutdown).on('SIGINT', shutdown)
//# sourceMappingURL=unit.js.map
