import path from 'path'

import is from '@magic/types'
import log from '@magic/log'

import stats from './stats'
import store from './store'

import { cleanFunctionString } from './lib'

import runSuite from './run/suite'

const run = async tests => {
  if (is.function(tests)) {
    tests = tests()
  }

  if (!is.object(tests)) {
    log.error('NO TEST SUITES', tests)
    return new Error('No Test Suites')
  }

  const suiteNames = Object.keys(tests)

  import pkg from path.join(process.cwd(), 'package.json')

  store.set({ module: pkg.name })

  await Promise.all(
    suiteNames.map(async name =>
      runSuite({
        pkg: pkg.name,
        parent: pkg.name,
        name,
        tests: tests[name],
      }),
    ),
  )

  stats.info()
}

export default run
