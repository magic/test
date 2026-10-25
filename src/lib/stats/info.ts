import log from '@magic/log'
import is from '@magic/types'

import { env } from '../env.js'
import { stringify } from '../stringify.js'
import { getDuration } from '../getDuration.js'
import { Store } from '../store.js'
import { isTestResult } from './isTestResult.js'
import { printPercent } from './printPercent.js'

import type { InputValue, Suite, Test, TestObject, TestResults } from '../../types.js'
import path from 'node:path'

const SLOW_TEST_THRESHOLD_MS = 500
const SLOW_TEST_REPORT_COUNT = 20

interface SlowTest {
  name: string
  duration: number
  key: string
  info?: string
}

const collectSlowTests = (suites: Suite[]): SlowTest[] => {
  const slow: SlowTest[] = []

  const walk = (item: Test | TestObject): void => {
    if (!is.objectNative(item)) {
      return
    }
    if (is.arr(item.tests)) {
      for (const t of item.tests) {
        walk(t)
      }
      return
    }
    const test = item
    if (
      isTestResult(test) &&
      typeof test.duration === 'number' &&
      test.duration >= SLOW_TEST_THRESHOLD_MS
    ) {
      slow.push({
        name: test.name,
        key: test.key,
        duration: test.duration,
        info: test.info,
      })
    }
  }

  for (const suite of suites) {
    walk(suite)
  }

  slow.sort((a, b) => b.duration - a.duration)
  return slow.slice(0, SLOW_TEST_REPORT_COUNT)
}

const formatDuration = (ms: number): string => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  return `${ms.toFixed(0)}ms`
}

/**
 * Prints test results for a package and its suites.
 */
export const info = (suites: Suite[], store: Store, useLogging: boolean = true): boolean => {
  const results = store.get<TestResults>('results')

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

    if (useLogging && (env.isVerbose() || percentage < 100)) {
      log.info('\n')
      log.info(`--- ${name}, Pass: ${pass}/${all} ${printPercent(percentage)}% ${duration}`)
      log.info('')
    }

    tests.forEach(test => {
      if (!isTestResult(test)) {
        return
      }

      const { pass, result, expString, key, msg, info } = test

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

    if (useLogging && (env.isVerbose() || percentage < 100)) {
      log.info('--------------------------')
    }
  })

  suites.forEach(suite => {
    if (!suite) {
      return
    }
    const { name } = suite
    if (name === undefined) {
      return
    }
    const { pass, all } = results[name] || { pass: 0, all: 0 }
    const passPercent = all > 0 ? (pass / all) * 100 : 0
    const percentage = printPercent(passPercent)

    if (useLogging && all > 0) {
      const logOutput = `${name} => Pass: ${pass}/${all} ${percentage}%`
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
  const totalDuration = getDuration(store, 'globalStartTime')
  const percentage = all > 0 ? printPercent((pass / all) * 100) : printPercent(0)

  if (useLogging && all > 0) {
    // Show total time if it differs from test execution time (indicates discovery overhead)
    if (totalDuration && totalDuration !== duration) {
      log(`\nRan ${all} tests in ${duration}. Passed ${pass}/${all} ${percentage}%`)
      log(`Total time (including discovery): ${totalDuration}\n`)
    } else {
      log(`Ran ${all} tests in ${duration}. Passed ${pass}/${all} ${percentage}%\n`)
    }
  }

  // Slow-test report: helps identify performance bottlenecks.
  const slowTests = collectSlowTests(suites)
  if (slowTests.length > 0) {
    const maxDur = slowTests[0]!.duration
    const thresholdLabel = formatDuration(SLOW_TEST_THRESHOLD_MS)
    const maxLabel = formatDuration(maxDur)
    const c = {
      reset: '\x1b[0m',
      dim: '\x1b[2m',
      yellow: '\x1b[33m',
      magenta: '\x1b[35m',
      red: '\x1b[31m',
      bold: '\x1b[1m',
    }
    console.log('\n' + c.bold + '═'.repeat(70) + c.reset)
    console.log(c.bold + `  Slowest Tests (≥ ${thresholdLabel})` + c.reset)
    console.log(c.bold + '═'.repeat(70) + c.reset + '\n')

    for (const t of slowTests) {
      let color = c.yellow
      if (t.duration > 2000) {
        color = c.magenta
      }
      if (t.duration > 5000) {
        color = c.red
      }
      // name and key are both the suite/file (tests in a file share a key),
      // so show the key; the `info` field is what identifies the individual
      // test within the file.
      const label = t.key || t.name
      console.log(`  ${color}${formatDuration(t.duration).padStart(8)}${c.reset}  ${label}`)
      if (t.info && t.info !== label) {
        console.log(`  ${c.dim}         ${t.info}${c.reset}`)
      }
    }

    console.log()
    console.log(
      `  ${c.dim}Showing ${slowTests.length} slowest of ${all} tests. Max: ${maxLabel}${c.reset}`,
    )
    console.log(c.bold + '═'.repeat(70) + c.reset + '\n')
  }

  return pass === all
}
