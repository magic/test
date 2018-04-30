const log = require('@magic/log')

const store = require('./store')

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

  if (stat.tests.indexOf(t) === -1) {
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

    const percentage = pass / all * 100

    log.info('\n')
    log.info(`--- ${suiteName}, Pass: ${pass}/${all} ${printPercent(percentage)}%`)
    log.info('')

    tests.forEach(test => {
      if (test.pass) {
        log.info(log.color('green', '* pass:'), test.msg, 'expected', test.expString)
      } else {
        log(
          log.color('red', '* fail:'),
          test.key.replace(/\./g, '/'),
          `got \`${test.msg}\``,
          `wanted: \`${test.expString}\``,
          test.info ? `\n info: ${test.info}` : '',
        )
      }

      if (test.info) {
        log.annotate(test.info)
      }
    })

    log.info('--------------------------')
  })

  const st = {
    pass: 0,
    all: 0,
    fail: 0,
  }

  suiteNames.forEach(suiteName => {
    const { pass = 0, all = 0, fail = 0 } = suites[suiteName]
    const percentage = printPercent(pass / all * 100)
    log.info(`${suiteName} => Pass: ${pass}/${all} ${percentage}%`)
    st.pass += pass
    st.all += all
    st.fail += fail
  })

  const percentage = printPercent(st.pass / st.all * 100)
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
