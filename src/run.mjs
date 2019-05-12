import path from 'path'

import is from '@magic/types'
import log from '@magic/log'

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

  const suiteNames = Object.keys(tests)

  const { default: pkg } = await import(path.join(process.cwd(), 'package.json'))
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