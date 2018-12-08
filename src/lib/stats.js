const log = require('@magic/log')

const store = require('./store')
const env = require('./env')

const test = t => {
  const suites = store.get('suites')
  let stat = suites[t.key]

  if (!stat) {
    stat = {
      pass: 0,
      fail: 0,
      all: 0,
      tests: [],
    }
  }

  if (!stat.tests.includes(t)) {
    stat.tests.push(t)
  }

  if (t.pass) {
    stat.pass += 1
  } else {
    stat.fail += 1
  }

  stat.all += 1

  const data = {
    suites: {
      [t.key]: stat,
    },
  }

  store.set(data)

  return stat
}

const printPercent = p => (p === 100 ? log.color('green', p) : log.color('red', p))

const info = results => {
  const suites = store.get('suites')
  const suiteNames = Object.keys(suites)

  const pkg = store.get('module')

  log(`###  Testing package: ${pkg}`)

  const s = {
    pass: 0,
    all: 0,
    fail: 0,
  }

  suiteNames.forEach(suiteName => {
    const { pass, all, fail, tests } = suites[suiteName]

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
      if (pass) {
        if (env.isVerbose()) {
          log.info(log.color('green', '* pass:'), 'got', result, 'expected', expString)
        }
      } else {
        log(
          log.color('red', '* fail:'),
          key.replace(/\./g, '/'),
          'executed: "',
          msg,
          '"\ngot: "',
          result,
          '"\nwanted: "',
          test.expString,
          test.info ? `\ninfo: ${log.annotate(test.info)}` : '',
          '\n',
        )
      }

      if ((!pass || env.isVerbose()) && test.info) {
        log.annotate(test.info)
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

  suiteNames.forEach(suiteName => {
    const { pass = 0, all = 0, fail = 0 } = suites[suiteName]
    const percentage = printPercent((pass / all) * 100)
    log.info(`${suiteName} => Pass: ${pass}/${all} ${percentage}%`)
    st.pass += pass
    st.all += all
    st.fail += fail
  })

  const percentage = printPercent((st.pass / st.all) * 100)
  log(`\n  Ran ${st.all} tests. Passed ${st.pass}/${st.all} ${percentage}%`)
}

const reset = () => {
  store.reset()
}

module.exports = {
  info,
  test,
  reset,
}
