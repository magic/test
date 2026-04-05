import path from 'node:path'

import is from '@magic/types'
import log from '@magic/log'
import fs from '@magic/fs'

import { stats, createStore, ERRORS } from './lib/index.ts'

import { runSuite } from './run/suite.ts'
import type { TestSuites, TestCollection } from './types.ts'

const cwd = process.cwd()

/**
 * Check if a value is a TestCollection (array of tests or test object with hooks)
 * @param {unknown} value
 * @returns {value is TestCollection}
 */
const isTestCollection = (value: unknown): value is TestCollection => {
  if (is.array(value)) {
    return true
  }
  if (is.objectNative(value) && 'tests' in value) {
    return true
  }
  return false
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

type RunOptions = {
  shards?: number
  shardId?: number
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
 * @returns {Promise<Error | void>}
 */
export const run = async (
  tests: TestSuites | (() => TestSuites),
  options: RunOptions = {},
): Promise<Error | void> => {
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

  let testsObj: TestSuites = is.function(tests) ? tests() : tests

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
  const beforeAllCleanup: (() => void | Promise<void>)[] = []
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
  const afterAllFns: (() => void | Promise<void>)[] = []
  for (const file of afterAllFiles) {
    const afterAll = testsObj[file]
    if (is.fn(afterAll)) {
      afterAllFns.push(() => afterAll(testsObj))
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


  let packagePath = path.join(cwd, 'package.json')

  const content = await fs.readFile(packagePath, 'utf8')
  const { name } = JSON.parse(content)

  // Filter to only include TestCollection entries (exclude hook functions)
  const allEntries = Object.entries(testsObj)
  const testEntries: [string, TestCollection][] = []
  for (const entry of allEntries) {
    if (isTestCollection(entry[1])) {
      testEntries.push(entry as [string, TestCollection])
    }
  }

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
        })
      }),
    )
  ).filter(s => !is.undef(s))

  if (aborted) {
    log.warn('Test run was aborted')
    return
  }

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

  stats.info(name, suites, store)
}
