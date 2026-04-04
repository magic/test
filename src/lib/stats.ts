import log from '@magic/log'
import is from '@magic/types'

import { env } from './env.ts'
import { stringify } from './stringify.ts'
import { getDuration } from './getDuration.ts'
import { Store } from './store.ts'
import type { InputValue, TestResult, TestStats, TestResults } from '../types.ts'

/**
 * Type guard to check if a value is a TestResult.
 */
export const isTestResult = (obj: unknown): obj is TestResult =>
  is.objectNative(obj) &&
  'result' in obj &&
  'expString' in obj &&
  'msg' in obj &&
  'pass' in obj &&
  'key' in obj

/**
 * Formats a number with fixed decimals and converts to number type.
 */
export const toMinimalFixed = (p: number, fix = 2): number => parseFloat(p.toFixed(fix))

/**
 * Returns a colored percentage string.
 */
export const printPercent = (p: number): string => {
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
 * Record a test result in the store, updating statistics for the test,
 * its parent, package, and global counters.
 */
export const test = (
  t: { name: string; parent?: string; pass: boolean; pkg?: string },
  store: Store,
): void => {
  const storeResults = store.get('results')
  const results: TestResults = (storeResults as TestResults | undefined) ?? {
    __PACKAGE_ROOT__: { all: 0, pass: 0 },
  }

  const { name, parent, pass, pkg } = t

  let currentName = name

  if (parent && parent !== name) {
    currentName = `${parent}.${name}`

    if (!results[parent]) {
      results[parent] = { all: 0, pass: 0 }
    }
    results[parent].all++
    if (pass) {
      results[parent].pass++
    }
  }

  if (pkg && pkg !== parent) {
    currentName = `${pkg}.${currentName}`

    if (!results[pkg]) {
      results[pkg] = { all: 0, pass: 0 }
    }
    results[pkg].all++
    if (pass) {
      results[pkg].pass++
    }
  }

  if (!results[currentName]) {
    results[currentName] = { all: 0, pass: 0 }
  }
  if (!results.__PACKAGE_ROOT__) {
    results.__PACKAGE_ROOT__ = { all: 0, pass: 0 }
  }

  results.__PACKAGE_ROOT__.all++
  results[currentName].all++
  if (pass) {
    results.__PACKAGE_ROOT__.pass++
    results[currentName].pass++
  }

  store.set({ results })
}

/**
 * Prints test results for a package and its suites.
 */
export const info = (pkg: string, suites: unknown[], store: Store): boolean => {
  log(`###  Testing package: ${pkg}`)

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

    if (env.isVerbose() || percentage < 100) {
      log.info('\n')
      log.info(`--- ${name}, Pass: ${pass}/${all} ${printPercent(percentage)}% ${duration}`)
      log.info('')
    }

    tests.forEach(test => {
      if (!isTestResult(test)) return

      const { pass, result, expString, key, msg, info } = test as TestResult

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
          `got: "${JSON.stringify(stringify(result as InputValue), null, 2)}"\n`,
          `wanted: "${JSON.stringify(stringify(expString as InputValue), null, 2)}"\n`,
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
    const { name } = suite as { name: string }
    const { pass, all } = results[name] || { pass: 0, all: 0 }
    const passPercent = all > 0 ? (pass / all) * 100 : 0
    const percentage = printPercent(passPercent)

    const logOutput = `${name} => Pass: ${pass}/${all} ${percentage}%`
    passPercent === 100 ? log.info(logOutput) : log.warn(logOutput)
  })

  const result = results.__PACKAGE_ROOT__ || { pass: 0, all: 0 }
  const { pass, all } = result
  const duration = getDuration(store)
  const percentage = all > 0 ? printPercent((pass / all) * 100) : printPercent(0)

  log(`Ran ${all} tests in ${duration}. Passed ${pass}/${all} ${percentage}%\n`)
  return true
}

/**
 * Reset the store to default state.
 */
export const reset = (store: Store): void => {
  store.reset()
}
