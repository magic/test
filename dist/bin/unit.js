#!/usr/bin/env node
// Register TypeScript loader before other imports
import './lib/registerLoader.js'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import log from '@magic/log'
import is from '@magic/types'
import { run, abort } from '../run.js'
import { maybeInjectMagic, readRecursive, resetVisitedDirs } from './lib/index.js'
import { prewarmComponentGraphs } from './lib/prewarmComponents.js'
import { buildDtsTestSuites } from '../lib/dts/index.js'
// Create globalStartTime BEFORE anything else for accurate total timing
const globalStartTime = log.hrtime()
export const getShardConfig = () => {
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
    // Inject virtual .d.ts type-check suites (one test per declared symbol
    // plus a "file compiles" test per declaration file) so `npm run test`
    // also verifies the package's declaration files automatically.
    // Disable with MAGIC_TEST_SKIP_DTS_TESTS=1.
    if (!process.env.MAGIC_TEST_SKIP_DTS_TESTS) {
      try {
        const dtsSuites = await buildDtsTestSuites(process.cwd())
        for (const [key, suite] of Object.entries(dtsSuites)) {
          tests[key] = suite
        }
      } catch (e) {
        // d.ts test generation must never break test collection
        console.error('Failed to generate .d.ts type tests:', e)
      }
    }
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
      process.exit(1)
    }
    // Compile the component graphs once on the main thread so the test
    // workers reuse the shared disk cache instead of each re-importing the
    // package graphs (see prewarmComponents.ts).
    await prewarmComponentGraphs(tests)
    const { shards, shardId, workers } = getShardConfig()
    const outcome = await run(tests, { shards, shardId, workers, globalStartTime })
    // run() no longer exits the process — the CLI decides the exit code.
    if (outcome instanceof Error || (outcome && outcome.failed)) {
      process.exit(1)
    }
    process.exit(0)
  } catch (e) {
    const err = e
    err.code = 'E_MAGIC_TEST'
    if (process.env.MAGIC_TEST_VERBOSE_ERRORS) {
      console.error('Import/runtime error:', err)
    }
    log.error(err)
    process.exit(1)
  }
}
export const handleError = error => {
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
export const shutdown = async () => {
  log.warn('Received shutdown signal, aborting tests...')
  await abort()
  process.exit(1)
}
// Only run the unit runner and install global handlers when executed
// directly (node dist/bin/unit.js). Importing this module (e.g. from tests)
// must not kick off the run or register process-level handlers.
// fs.realpathSync resolves symlinks so the check works when the bin is invoked
// via a symlinked node_modules (e.g. pnpm, npm workspaces).
const isMain =
  process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  init()
  process.on('unhandledRejection', handleError).on('uncaughtException', handleError)
  process.on('SIGTERM', shutdown).on('SIGINT', shutdown)
}
//# sourceMappingURL=unit.js.map
