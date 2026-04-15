import log from '@magic/log'
import { env } from '../env.js'
import { stringify } from '../stringify.js'
import { getDuration } from '../getDuration.js'
import { isTestResult } from './isTestResult.js'
import { printPercent } from './printPercent.js'
/**
 * Prints test results for a package and its suites.
 */
export const info = (suites, store) => {
  const results = store.get('results')
  if (!results) {
    return true
  }
  suites.forEach(suite => {
    if (!suite) {
      return
    }
    const suiteObj = suite
    const { tests, duration, name } = suiteObj
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
          `got: "${JSON.stringify(stringify(result), null, 2)}"\n`,
          `wanted: "${JSON.stringify(stringify(expString), null, 2)}"\n`,
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
    if (passPercent === 100) {
      log.info(logOutput)
    } else {
      log.warn(logOutput)
    }
  })
  const result = results.__PACKAGE_ROOT__ || { pass: 0, all: 0 }
  const { pass, all } = result
  const duration = getDuration(store)
  const percentage = all > 0 ? printPercent((pass / all) * 100) : printPercent(0)
  log(`Ran ${all} tests in ${duration}. Passed ${pass}/${all} ${percentage}%\n`)
  return true
}
