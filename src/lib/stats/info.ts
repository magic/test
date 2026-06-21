import log from '@magic/log'

import { env } from '../env.ts'
import { stringify } from '../stringify.ts'
import { getDuration } from '../getDuration.ts'
import { Store } from '../store.ts'
import { isTestResult } from './isTestResult.ts'
import { printPercent } from './printPercent.ts'

import type { InputValue, TestResult, TestResults } from '../../types.ts'
import path from 'node:path'

/**
 * Prints test results for a package and its suites.
 */
export const info = (suites: unknown[], store: Store, useLogging: boolean = true): boolean => {
  const results = store.get('results') as TestResults | undefined

  if (!results) {
    return true
  }

  suites.forEach(suite => {
    if (!suite) {
      return
    }

    const suiteObj = suite as { tests?: unknown[]; duration?: string; name: string }
    const { tests, duration, name } = suiteObj
    if (!tests) {
      return
    }

    const result = results[name] || { all: 0, pass: 0 }
    const { pass, all } = result
    const percentage = all > 0 ? (pass / all) * 100 : 0

    if ((useLogging && env.isVerbose()) || percentage < 100) {
      log.info('\n')
      log.info(`--- ${name}, Pass: ${pass}/${all} ${printPercent(percentage)}% ${duration}`)
      log.info('')
    }

    tests.forEach(test => {
      if (!isTestResult(test)) {
        return
      }

      const { pass, result, expString, key, msg, info } = test as TestResult

      if (key !== name) {
        return
      }

      if (pass) {
        if (env.isVerbose()) {
          log.info(log.color('green', '* pass:'), 'got', result, 'expected', expString)
        }
      } else {
        const basename = path.basename(key)
        const dirname = path.dirname(key).replace('.', '/')

        const cleanKey = `${dirname}/${basename}`

        if (useLogging) {
          log(
            log.color('red', '* fail:'),
            cleanKey,
            `executed: "${msg.toString().slice(0, 40).concat('...')}"\n`,
            `got: "${JSON.stringify(stringify(result as InputValue), null, 2)}"\n`,
            `wanted: "${JSON.stringify(stringify(expString as InputValue), null, 2)}"\n`,
            info ? `info: ${log.paint('grey', info)}\n` : '',
          )
        }
      }
    })

    if ((useLogging && env.isVerbose()) || percentage < 100) {
      log.info('--------------------------')
    }
  })

  suites.forEach(suite => {
    if (!suite) {
      return
    }
    const { name } = suite as { name: string }
    const { pass, all } = results[name] || { pass: 0, all: 0 }
    const passPercent = all > 0 ? (pass / all) * 100 : 0
    const percentage = printPercent(passPercent)

    const logOutput = `${name} => Pass: ${pass}/${all} ${percentage}%`
    if (useLogging) {
      if (passPercent === 100) {
        log.info(logOutput)
      } else {
        log.warn(logOutput)
      }
    }
  })

  const result = results.__PACKAGE_ROOT__ || { pass: 0, all: 0 }
  const { pass, all } = result
  const duration = getDuration(store)
  const percentage = all > 0 ? printPercent((pass / all) * 100) : printPercent(0)

  if (useLogging) {
    log(`Ran ${all} tests in ${duration}. Passed ${pass}/${all} ${percentage}%\n`)
  }
  return true
}
