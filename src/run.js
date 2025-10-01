import path from 'node:path'

import is from '@magic/types'
import log from '@magic/log'
import fs from '@magic/fs'

import { stats, store } from './lib/index.js'

import { runSuite } from './run/suite.js'

const cwd = process.cwd()

/** @typedef {import('./run/suite.js').Suite} Suite */
/** @typedef {import('./run/test.js').Test} Test */
/** @typedef {import('./run/suite.js').TestsWithHooks} TestsWithHooks */

/**
 * Global test hooks object with special file-based keys
 * @typedef {Record<string, unknown> & {
 *   '/beforeAll.js'?: (tests: Record<string, unknown>) => (void | Promise<void | (() => (void | Promise<void>))>),
 *   '/afterAll.js'?: (tests: Record<string, unknown>) => (void | Promise<void>)
 * }} TestSuites
 */

/**
 * Run all test suites
 * @param {(() => (Record<string, unknown> & TestSuites)) | (Record<string, unknown> & TestSuites)} tests - Test suites object or function that returns one
 * @returns {Promise<Error | void>}
 */
export const run = async tests => {
  const startTime = log.hrtime()
  store.set({ startTime })

  if (is.function(tests)) {
    tests = tests()
  }

  if (!is.object(tests)) {
    log.error('NO TEST SUITES', tests)
    return new Error('No Test Suites')
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
    Object.entries(tests).map(
      async ([name, testsValue]) =>
        await runSuite({
          pkg: name,
          parent: name,
          name,
          tests: /** @type {Test[] | (Record<string, unknown> & TestsWithHooks)} */ (testsValue),
        }),
    ),
  )

  if (afterAll) {
    await Promise.all(afterAll.filter(is.fn).map(fn => fn(tests)))
  }

  stats.info(name, suites)
}
