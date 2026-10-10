import is from '@magic/types'
import log from '@magic/log'

import { stats, createStore, ERRORS, Store } from './lib/index.js'
import { BEFORE_ALL_KEYS, AFTER_ALL_KEYS } from './lib/hookFiles.js'
import { runSuite } from './run/suite.js'
import type { TestSuites, TestCollection, CleanupFunction, TestResult } from './types.js'
import { printTraceSummary, isTraceEnabled } from './lib/trace/timing.js'
import { clearCache as clearPersistentCache } from './lib/caches/persistentCache.js'

/**
 * Aggregate raw test results into the store's results object.
 * This replaces the incremental stats.test() calls to avoid race conditions.
 */
const aggregateResults = (rawResults: TestResult[], store: Store): void => {
  const results: Record<string, { all: number; pass: number }> = {
    __PACKAGE_ROOT__: { all: 0, pass: 0 },
  }

  for (const r of rawResults) {
    if (!r) {
      continue
    }

    const testKey = r.key || ''
    if (!testKey) {
      continue
    }

    // Test-level entry
    if (!results[testKey]) {
      results[testKey] = { all: 0, pass: 0 }
    }
    results[testKey]!.all++
    if (r.pass) {
      results[testKey]!.pass++
    }

    // Parent-level (suite)
    if (r.parent && r.parent !== testKey) {
      if (!results[r.parent]) {
        results[r.parent] = { all: 0, pass: 0 }
      }
      results[r.parent]!.all++
      if (r.pass) {
        results[r.parent]!.pass++
      }
    }

    // Package-level
    if (r.pkg && r.pkg !== r.parent && r.pkg !== testKey) {
      if (!results[r.pkg]) {
        results[r.pkg] = { all: 0, pass: 0 }
      }
      results[r.pkg]!.all++
      if (r.pass) {
        results[r.pkg]!.pass++
      }
    }

    // Package root
    results.__PACKAGE_ROOT__!.all++
    if (r.pass) {
      results.__PACKAGE_ROOT__!.pass++
    }
  }

  store.set({ results })
}

/**
 * @typedef {Record<string, unknown>} TestSuitesRecord
 */

/** @type {boolean} */
export let aborted = false

/**
 * Abort the current test run and clean up temp directories
 */
export const abort = async () => {
  aborted = true
  // Persistent cache saves on each write, no need for explicit save on abort
}

/**
 * Reset abort flag
 */
export const resetAbort = () => {
  aborted = false
}

type RunOptions = {
  shards?: number
  shardId?: number
  workers?: number
  clearCache?: boolean
  globalStartTime?: [number, number]
}

/**
 * Outcome of a completed test run.
 */
export type RunResult = {
  /** true if any test failed */
  failed: boolean
}

/**
 * FNV-1a hash function for sharding
 * @param {string} testPath
 * @param {number} totalShards
 * @returns {number}
 */
const getShardForTest = (testPath: string, totalShards: number): number => {
  let hash = 2166136261
  for (let i = 0; i < testPath.length; i++) {
    hash ^= testPath.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % totalShards
}

/**
 * @typedef {Object} RunOptions
 * @property {number} [shards] - Number of shards to split tests into
 * @property {number} [shardId] - Which shard to run (0-indexed)
 */

/**
 * Run all test suites
 * @param {TestSuites | (() => TestSuites)} tests - Test suites object or function that returns one
 * @param {RunOptions} [options] - Run options including sharding
 * @returns {Promise<RunResult | Error | void>} - Run result, an error if no tests were found, or void if aborted
 */
export const run = async (
  tests: TestSuites | (() => TestSuites),
  options: RunOptions = {},
): Promise<RunResult | Error | void> => {
  const { shards = 1, shardId = 0, workers, clearCache, globalStartTime } = options

  // Clear persistent cache if requested
  if (clearCache) {
    await clearPersistentCache()
  }

  // Set environment variables for sharding (user-facing override; the values
  // are also passed directly as options below)
  if (shards > 1) {
    process.env.MAGIC_TEST_SHARDING_SHARDS = String(shards)
    process.env.MAGIC_TEST_SHARDING_ID = String(shardId)
  }

  if (!is.undefined(workers)) {
    process.env.MAGIC_TEST_WORKERS = String(workers)
  }

  resetAbort()

  const store = createStore()
  // Use globalStartTime if provided (from unit.ts), otherwise create new one
  const startTime = globalStartTime || log.hrtime()
  store.set({ startTime, globalStartTime })

  const rawResults: TestResult[] = []

  let testsObj: TestSuites = is.function(tests) ? tests() : tests

  if (!is.object(testsObj)) {
    log.error(ERRORS.E_NO_TESTS!, { received: testsObj })
    return new Error(ERRORS.E_NO_TESTS!)
  }

  // Define all beforeAll/afterAll file variants in execution order
  // (canonical list lives in lib/hookFiles.ts)
  const beforeAllFiles = [...BEFORE_ALL_KEYS]

  const afterAllFiles = [...AFTER_ALL_KEYS]

  // Collect beforeAll functions and their cleanup handlers
  const beforeAllCleanup: CleanupFunction[] = []
  for (const file of beforeAllFiles) {
    const beforeAll = testsObj[file]
    if (is.fn(beforeAll)) {
      const cleanup = await (
        beforeAll as unknown as (tests: TestSuites) => void | Promise<void | CleanupFunction>
      )(testsObj)
      if (is.fn(cleanup)) {
        beforeAllCleanup.push(cleanup)
      }
    }
    delete testsObj[file]
  }

  // Collect afterAll functions (to run after tests)
  const afterAllFns: (() => void | Promise<void>)[] = []
  for (const file of afterAllFiles) {
    const afterAll = testsObj[file]
    if (is.fn(afterAll)) {
      afterAllFns.push(() =>
        (afterAll as unknown as (tests: TestSuites) => void | Promise<void>)(testsObj),
      )
    }
    delete testsObj[file]
  }

  // Filter tests by shard if sharding is enabled
  if (shards > 1) {
    const filtered: TestSuites = {}
    for (const [key, value] of Object.entries(testsObj)) {
      const shard = getShardForTest(key, shards)
      if (shard === shardId) {
        filtered[key] = value as TestCollection
      }
    }
    testsObj = filtered
  }

  // After removing hook files, all remaining entries should be processed as test suites.
  // convertSuite will handle arrays, functions, and objects (including plain test objects).
  const testEntries: [string, unknown][] = Object.entries(testsObj)

  const suites = (
    await Promise.all(
      testEntries.map(async ([name, testsValue]) => {
        if (aborted) {
          return
        }
        return await runSuite({
          pkg: name,
          parent: name,
          name,
          tests: testsValue as TestCollection,
          store,
          rawResults,
        })
      }),
    )
  ).filter(s => !is.undef(s))

  if (aborted) {
    log.warn('Test run was aborted')
    return
  }

  // Aggregate all raw results into store (single pass, race-free)
  aggregateResults(rawResults, store)

  // Run all afterAll files
  for (const afterAll of afterAllFns) {
    await afterAll()
  }

  // Run all beforeAll cleanup handlers (no arguments)
  for (const cleanup of beforeAllCleanup) {
    await cleanup()
  }

  // Persistent cache saves on each write, no need for explicit save here

  const allPassed = stats.info(suites, store)

  // Print compile trace summary if enabled
  if (isTraceEnabled()) {
    printTraceSummary()
  }

  // The library must not terminate the process — the CLI (bin/unit.ts)
  // decides the exit code from this result.
  return { failed: !allPassed }
}
