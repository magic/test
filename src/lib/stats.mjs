import log from '@magic/log'

import store from './store.mjs'
import { env } from './env.mjs'
import { stringify } from './stringify.mjs'
import { getDuration } from './getDuration.mjs'

const defaultStats = {
  pass: 0,
  fail: 0,
  all: 0,
  tests: [],
}

export const test = t => {
  const suites = store.get('suites')
  const suite = { ...defaultStats, ...suites[t.key] }

  if (!suite.tests.includes(t)) {
    suite.tests.push(t)
  }

  // add statistics
  if (t.pass) {
    suite.pass += 1
  } else {
    suite.fail += 1
  }

  suite.all += 1

  suites[t.key] = suite

  store.set({ suites })

  return suite
}

export const printPercent = p => (p === 100 ? log.color('green', p) : log.color('red', p))

export const info = () => {
  const suites = store.get('suites')

  const pkg = store.get('module')

  log(`###  Testing package: ${pkg}`)

  const s = {
    pass: 0,
    all: 0,
    fail: 0,
  }

  Object.entries(suites).forEach(([suiteName, suite]) => {
    console.log(suiteName, suite.duration)
    const { all, fail, pass, tests, duration } = suite

    s.pass += pass
    s.all += all
    s.fail += fail

    const percentage = (pass / all) * 100

    if (env.isVerbose() || percentage < 100) {
      log.info('\n')
      log.info(`--- ${suiteName}, Pass: ${pass}/${all} ${printPercent(percentage)}%`)
      log.info('')
    }

    tests.forEach(test => {
      const { pass, result, expString, key, msg, info } = test

      // dirty workaround for now, all suites get all tests passed in test() above
      if (key !== suiteName) {
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
          `executed: "${msg}"\n`,
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

  const st = {
    pass: 0,
    all: 0,
    fail: 0,
  }

  Object.entries(suites).forEach(([suiteName, suite]) => {
    const { pass = 0, all = 0, fail = 0 } = suite
    const passPercent = (pass / all) * 100
    const percentage = printPercent(passPercent)

    const logOutput = `${suiteName} => Pass: ${pass}/${all} ${percentage}%`
    if (passPercent === 100) {
      log.info(logOutput)
    } else {
      log.warn(logOutput)
    }
    st.pass += pass
    st.all += all
    st.fail += fail
  })

  const duration = getDuration()

  const percentage = printPercent((st.pass / st.all) * 100)
  log(`Ran ${st.all} tests in ${duration}. Passed ${st.pass}/${st.all} ${percentage}%\n`)
  return true
}

export const reset = () => {
  store.reset()
}

export const stats = {
  info,
  test,
  reset,
}

export default stats
