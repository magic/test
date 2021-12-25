import log from '@magic/log'

import { env } from '../env.mjs'
import { stringify } from '../stringify.mjs'
import { getDuration } from '../getDuration.mjs'
import { store } from '../store.mjs'

export const printPercent = p => (p === 100 ? log.color('green', p) : log.color('red', p))

export const info = (pkg, suites) => {
  log(`###  Testing package: ${pkg}`)

  const results = store.get('results')

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

    const percentage = (pass / all) * 100

    if (env.isVerbose() || percentage < 100) {
      log.info('\n')
      log.info(`--- ${name}, Pass: ${pass}/${all} ${printPercent(percentage)}% ${duration}`)
      log.info('')
    }

    tests.forEach(test => {
      if (!test) {
        return
      }

      const { pass, result, expString, key, msg, info } = test

      // dirty workaround for now, all suites get all tests passed in test()
      if (key !== name) {
        return
      }

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
    if (!suite) {
      return
    }

    const { name } = suite
    const { pass, all } = results[name]

    const passPercent = (pass / all) * 100
    const percentage = printPercent(passPercent)

    const logOutput = `${name} => Pass: ${pass}/${all} ${percentage}%`
    if (passPercent === 100) {
      log.info(logOutput)
    } else {
      log.warn(logOutput)
    }
  })

  const result = results.__PACKAGE_ROOT__
  const { pass, all } = result

  const duration = getDuration()

  const percentage = printPercent((pass / all) * 100)
  log(`Ran ${all} tests in ${duration}. Passed ${pass}/${all} ${percentage}%\n`)
  return true
}
