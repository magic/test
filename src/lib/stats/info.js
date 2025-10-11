import log from '@magic/log'

import { env } from '../env.js'
import { stringify } from '../stringify.js'
import { getDuration } from '../getDuration.js'
import { store } from '../store.js'
import is from '@magic/types'

/**
 * Type guard to check if a value is a TestResult.
 * @param {Suite | TestResult} obj
 * @returns {obj is TestResult}
 */
export const isTestResult = obj =>
  is.objectNative(obj) &&
  'result' in obj &&
  'expString' in obj &&
  'msg' in obj &&
  'pass' in obj &&
  'key' in obj

/**
 * Formats a number with fixed decimals and converts to number type.
 *
 * @param {number} p - The number to format.
 * @param {number} [fix=2] - Decimal places to fix.
 * @returns {number}
 */
export const toMinimalFixed = (p, fix = 2) => parseFloat(p.toFixed(fix))

/**
 * Returns a colored percentage string.
 *
 * @param {number} p - Percentage value.
 * @returns {string}
 */
export const printPercent = p => {
  let color = 'red'
  if (p === 100) {
    color = 'green'
  } else if (p > 90) {
    color = 'yellow'
  }

  const value = toMinimalFixed(p, 2)

  return log.color(color, value)
}

/**
 * Prints test results for a package and its suites.
 *
 * @param {string} pkg - Package name.
 * @param {(Suite | undefined | void)[]} suites - Array of test suites.
 * @returns {boolean} Always returns true.
 */
export const info = (pkg, suites) => {
  log(`###  Testing package: ${pkg}`)

  const results = store.get('results')

  if (!results) {
    return true
  }

  suites.forEach(suite => {
    if (!suite) {
      return
    }

    const { tests, duration, name } = suite
    if (!tests) {
      return
    }

    const result = results[name] || { all: 0, pass: 0 }
    const { pass, all } = result
    const percentage = all > 0 ? (pass / all) * 100 : 0

    if (env.isVerbose() || percentage < 100) {
      log.info('\n')
      log.info(`--- ${name}, Pass: ${pass}/${all} ${printPercent(percentage)}% ${duration}`)
      log.info('')
    }

    tests.forEach(test => {
      if (!isTestResult(test)) return

      const { pass, result, expString, key, msg, info } = test

      if (key !== name) return

      if (pass) {
        if (env.isVerbose()) {
          log.info(log.color('green', '* pass:'), 'got', result, 'expected', expString)
        }
      } else {
        log(
          log.color('red', '* fail:'),
          key.replace(/\./g, '/'),
          `executed: "${msg.toString().slice(0, 40).concat('...')}"\n`,
          `got: "${JSON.stringify(stringify(/** @type {import('../stringify.js').InputValue} */ (result)), null, 2)}"\n`,
          `wanted: "${JSON.stringify(stringify(/** @type {import('../stringify.js').InputValue} */ (expString)), null, 2)}"\n`,
          info ? `info: ${log.paint('grey', info)}\n` : '',
        )
      }
    })

    if (env.isVerbose() || percentage < 100) {
      log.info('--------------------------')
    }
  })

  suites.forEach(suite => {
    if (!suite) return
    const { name } = suite
    const { pass, all } = results[name] || { pass: 0, all: 0 }
    const passPercent = all > 0 ? (pass / all) * 100 : 0
    const percentage = printPercent(passPercent)

    const logOutput = `${name} => Pass: ${pass}/${all} ${percentage}%`
    passPercent === 100 ? log.info(logOutput) : log.warn(logOutput)
  })

  const result = results.__PACKAGE_ROOT__ || { pass: 0, all: 0 }
  const { pass, all } = result
  const duration = getDuration()
  const percentage = all > 0 ? printPercent((pass / all) * 100) : printPercent(0)

  log(`Ran ${all} tests in ${duration}. Passed ${pass}/${all} ${percentage}%\n`)
  return true
}
