import path from 'path'

import is from '@magic/types'
import log from '@magic/log'
import fs from '@magic/fs'

import { stats, store } from './lib/index.mjs'

import runSuite from './run/suite.mjs'

const cwd = process.cwd()

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

  const beforeAll = tests['/beforeAll.mjs']
  let afterAll = tests['/afterAll.mjs'] ? [tests['/afterAll.mjs']] : []

  delete tests['/beforeAll.mjs']
  delete tests['/afterAll.mjs']

  // execute beforeall and save the result in the afterAll array for later
  if (is.fn(beforeAll)) {
    afterAll.push(await beforeAll(tests))
  }

  let packagePath = path.join(cwd, 'package.json')

  const content = await fs.readFile(packagePath, 'utf8')
  const { name } = JSON.parse(content)
  store.set({ module: name })

  await Promise.all(
    Object.entries(tests).map(
      async ([name, tests]) =>
        await runSuite({
          pkg: name,
          parent: name,
          name,
          tests,
        }),
    ),
  )

  if (afterAll) {
    await Promise.all(afterAll.filter(is.fn).map(fn => fn(tests)))
  }

  stats.info()
}
