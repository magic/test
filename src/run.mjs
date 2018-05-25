import path from 'path'
import fs from 'fs'

import is from '@magic/types'
import log from '@magic/log'

import { store, stats, cleanFunctionString } from './lib'

import runSuite from './run/suite'

export const run = async tests => {
  if (is.function(tests)) {
    tests = tests()
  }

  if (!is.object(tests)) {
    log.error('NO TEST SUITES', tests)
    return new Error('No Test Suites')
  }

  const suiteNames = Object.keys(tests)

  const pkgPath = path.join(process.cwd(), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  store.set({ module: pkg.name })

  await Promise.all(
    suiteNames.map(
      async name =>
        await runSuite({
          pkg: pkg.name,
          parent: pkg.name,
          name,
          tests: await tests[name],
        }),
    ),
  )

  stats.info()
}

export default run
