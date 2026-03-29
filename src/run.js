import path from 'node:path'

import is from '@magic/types'
import log from '@magic/log'
import fs from '@magic/fs'

import { stats, createStore, ERRORS } from './lib/index.js'

import { runSuite } from './run/suite.js'

const cwd = process.cwd()

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
 * Run all test suites
 * @param {TestSuites | (() => TestSuites)} tests - Test suites object or function that returns one
 * @returns {Promise<Error | void>}
 */
export const run = async tests => {
  resetAbort()

  const store = createStore()
  const startTime = log.hrtime()
  store.set({ startTime })

  if (is.function(tests)) {
    tests = tests()
  }

  if (!is.object(tests)) {
    log.error(ERRORS.E_NO_TESTS, { received: tests })
    return new Error(ERRORS.E_NO_TESTS)
  }

  const beforeAll = tests['/beforeAll.js']
  let afterAll = tests['/afterAll.js'] ? [tests['/afterAll.js']] : []

  delete tests['/beforeAll.js']
  delete tests['/afterAll.js']

  // execute beforeall and save the result in the afterAll array for later
  if (is.fn(beforeAll)) {
    const after = await beforeAll(tests)
    if (after) {
      afterAll.push(after)
    }
  }

  let packagePath = path.join(cwd, 'package.json')

  const content = await fs.readFile(packagePath, 'utf8')
  const { name } = JSON.parse(content)

  const suites = await Promise.all(
    Object.entries(tests).map(async ([name, testsValue]) => {
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

  if (aborted) {
    log.warn('Test run was aborted')
    return
  }

  if (afterAll) {
    await Promise.all(afterAll.filter(is.fn).map(fn => fn(tests)))
  }

  const tmpDir = path.join(cwd, 'test', '.tmp')
  if (await fs.exists(tmpDir)) {
    await fs.rmrf(tmpDir)
  }

  stats.info(name, suites, store)
}
