import path from 'node:path'

import is from '@magic/types'
import log from '@magic/log'
import fs from '@magic/fs'

import { stats, createStore, ERRORS } from './lib/index.js'

import { runSuite } from './run/suite.js'

/** @typedef {import('./types.ts').TestSuites} TestSuites */
/** @typedef {import('./types.ts').TestCollection} TestCollection */

const cwd = process.cwd()

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
 * @typedef {Object} RunOptions
 * @property {number} [shards] - Number of shards to split tests into
 * @property {number} [shardId] - Which shard to run (0-indexed)
 */

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

  /** @type {TestSuitesRecord} */
  let testsObj

  if (is.function(tests)) {
    testsObj = tests()
  } else {
    testsObj = tests
  }

  if (!is.object(testsObj)) {
    log.error(ERRORS.E_NO_TESTS, { received: testsObj })
    return new Error(ERRORS.E_NO_TESTS)
  }

  const beforeAll = testsObj['/beforeAll.js']
  let afterAll = testsObj['/afterAll.js'] ? [testsObj['/afterAll.js']] : []

  delete testsObj['/beforeAll.js']
  delete testsObj['/afterAll.js']

  // Filter tests by shard if sharding is enabled
  if (shards > 1) {
    /** @type {TestSuitesRecord} */
    const filtered = {}
    for (const [key, value] of Object.entries(testsObj)) {
      const shard = getShardForTest(key, shards)
      if (shard === shardId) {
        filtered[key] = value
      }
    }
    testsObj = filtered
  }

  // execute beforeall and save the result in the afterAll array for later
  if (is.fn(beforeAll)) {
    const after = await beforeAll(testsObj)
    if (after) {
      afterAll.push(after)
    }
  }

  let packagePath = path.join(cwd, 'package.json')

  const content = await fs.readFile(packagePath, 'utf8')
  const { name } = JSON.parse(content)

  const suites = (
    await Promise.all(
      Object.entries(testsObj).map(async ([name, testsValue]) => {
        if (aborted) {
          return
        }
        return await runSuite({
          pkg: name,
          parent: name,
          name,
          tests: /** @type {TestCollection} */ (testsValue),
          store,
        })
      }),
    )
  ).filter(s => !is.undef(s))

  if (aborted) {
    log.warn('Test run was aborted')
    return
  }

  if (afterAll) {
    await Promise.all(afterAll.filter(is.fn).map(fn => fn(testsObj)))
  }

  const tmpDir = path.join(cwd, 'test', '.tmp')
  if (await fs.exists(tmpDir)) {
    await fs.rmrf(tmpDir)
  }

  stats.info(name, suites, store)
}
