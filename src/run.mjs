import path from 'path'

import is from '@magic/types'
import log from '@magic/log'
import fs from '@magic/fs'

import { stats, store } from './lib/index.mjs'

import runSuite from './run/suite.mjs'

const run = async tests => {
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

  const suiteNames = Object.keys(tests)

  let packagePath = path.join(process.cwd(), 'package.json')
  if (path.sep === '\\') {
    packagePath = 'file:\\\\\\' + packagePath
  }

  const content = await fs.readFile(packagePath, 'utf8')
  const { name } = JSON.parse(content)
  store.set({ module: name })

  await Promise.all(
    suiteNames.map(async name =>
      runSuite({
        pkg: name,
        parent: name,
        name,
        tests: tests[name],
      }),
    ),
  )

  if (afterAll) {
    await Promise.all(afterAll.filter(is.fn).map(fn => fn(tests)))
  }

  stats.info()
}

export default run
