import path from 'node:path'
import is from '@magic/types'
import log from '@magic/log'
import fs from '@magic/fs'
import { stats, createStore, ERRORS } from './lib/index.js'
import { runSuite } from './run/suite.js'
const cwd = process.cwd()
/**
 * Aggregate raw test results into the store's results object.
 * This replaces the incremental stats.test() calls to avoid race conditions.
 */
const aggregateResults = (rawResults, store) => {
  const results = {
    __PACKAGE_ROOT__: { all: 0, pass: 0 },
  }
  for (const r of rawResults) {
    if (!r) continue
    const testKey = r.key || ''
    if (!testKey) continue
    // Test-level entry
    if (!results[testKey]) {
      results[testKey] = { all: 0, pass: 0 }
    }
    results[testKey].all++
    if (r.pass) results[testKey].pass++
    // Parent-level (suite)
    if (r.parent && r.parent !== testKey) {
      if (!results[r.parent]) {
        results[r.parent] = { all: 0, pass: 0 }
      }
      results[r.parent].all++
      if (r.pass) results[r.parent].pass++
    }
    // Package-level
    if (r.pkg && r.pkg !== r.parent && r.pkg !== testKey) {
      if (!results[r.pkg]) {
        results[r.pkg] = { all: 0, pass: 0 }
      }
      results[r.pkg].all++
      if (r.pass) results[r.pkg].pass++
    }
    // Package root
    results.__PACKAGE_ROOT__.all++
    if (r.pass) results.__PACKAGE_ROOT__.pass++
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
  const tmpDir = path.join(cwd, 'test', '.tmp')
  try {
    if (await fs.exists(tmpDir)) {
      await fs.rmrf(tmpDir)
    }
  } catch {
    // Ignore cleanup errors during abort
  }
}
/**
 * Reset abort flag
 */
export const resetAbort = () => {
  aborted = false
}
/**
 * FNV-1a hash function for sharding
 * @param {string} testPath
 * @param {number} totalShards
 * @returns {number}
 */
const getShardForTest = (testPath, totalShards) => {
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
 * @returns {Promise<Error | void>}
 */
export const run = async (tests, options = {}) => {
  const { shards = 1, shardId = 0 } = options
  // Set environment variables for sharding (used by unit.js and t.js)
  if (shards > 1) {
    process.env.MAGIC_TEST_SHARDING_SHARDS = String(shards)
    process.env.MAGIC_TEST_SHARDING_ID = String(shardId)
  }
  resetAbort()
  const store = createStore()
  const startTime = log.hrtime()
  store.set({ startTime })
  const rawResults = []
  let testsObj = is.function(tests) ? tests() : tests
  if (!is.object(testsObj)) {
    log.error(ERRORS.E_NO_TESTS, { received: testsObj })
    return new Error(ERRORS.E_NO_TESTS)
  }
  // Define all beforeAll/afterAll file variants in execution order
  const beforeAllFiles = [
    '/beforeAll.js',
    '/beforeall.js',
    '/beforeAll.ts',
    '/beforeall.ts',
    '/beforeAll.mjs',
    '/beforeall.mjs',
  ]
  const afterAllFiles = [
    '/afterAll.js',
    '/afterall.js',
    '/afterAll.ts',
    '/afterall.ts',
    '/afterAll.mjs',
    '/afterall.mjs',
  ]
  // Collect beforeAll functions and their cleanup handlers
  const beforeAllCleanup = []
  for (const file of beforeAllFiles) {
    const beforeAll = testsObj[file]
    if (is.fn(beforeAll)) {
      const cleanup = await beforeAll(testsObj)
      if (is.fn(cleanup)) {
        beforeAllCleanup.push(cleanup)
      }
    }
    delete testsObj[file]
  }
  // Collect afterAll functions (to run after tests)
  const afterAllFns = []
  for (const file of afterAllFiles) {
    const afterAll = testsObj[file]
    if (is.fn(afterAll)) {
      afterAllFns.push(() => afterAll(testsObj))
    }
    delete testsObj[file]
  }
  // Filter tests by shard if sharding is enabled
  if (shards > 1) {
    const filtered = {}
    for (const [key, value] of Object.entries(testsObj)) {
      const shard = getShardForTest(key, shards)
      if (shard === shardId) {
        filtered[key] = value
      }
    }
    testsObj = filtered
  }
  // After removing hook files, all remaining entries should be processed as test suites.
  // convertSuite will handle arrays, functions, and objects (including plain test objects).
  const testEntries = Object.entries(testsObj)
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
          tests: testsValue,
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
  const tmpDir = path.join(cwd, 'test', '.tmp')
  if (await fs.exists(tmpDir)) {
    await fs.rmrf(tmpDir)
  }
  stats.info(suites, store)
  process.exit(0)
}
