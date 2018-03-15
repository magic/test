const { VERBOSE } = process.env
const { isDefined, isFalsy, isNumber, isObject } = require('types')

const log = require('./log')

const storage = {
  suites: {},
  stats: {
    all: 0,
    pass: 0,
    fail: 0,
  },
  pkg: '',
}

const set = (key, value) => {
  if (storage[key]) {
    storage[key] = Object.assign({}, storage[key], value)
  }

  storage[key] = value
  return storage[key]
}

const get = (key) => {
  if (isDefined(storage[key])) {
    return storage[key]
  }

  return undefined
}

const add = (key, value) => {
  const data = get(key)

  Object.keys(value).forEach(k => {
    if (isObject(data)) {
      if (isNumber(data[k]) && isNumber(value[k])) {
        data[k] += value[k]
      }
    }
  })

  storage[key] = data

  return data
}

const test = t => {
  let stat = storage.suites[t.key]
  let stats = storage.stats

  if (!stat) {
    stat = {
      pass: t.pass === false ? 0 : 1,
      fail: t.pass ? 1 : 0,
      all: 1,
      tests: [t],
    }
  }

  if (stat.tests.indexOf(t) === -1) {
    stat.tests.push(t)
  }

  if (t.pass) {
    stat.pass += 1
    stats.pass += 1
  }
  else {
    stat.fail += 1
    stats.fail += 1
  }

  stat.all += 1
  stats.all += 1
  storage.suites[t.key] = stat
  storage.stats = stats
}

const printPercent = p => p === 100 ? log.paint('green', p) : log.paint('red', p)

const info = (results) => {
  const suites = storage.suites
  const suiteNames = Object.keys(storage.suites)

  const pkg = storage.module

  log(`###  Testing package: ${pkg}`)

  suiteNames.forEach(suiteName => {
    const { pass, fail, all, tests } = suites[suiteName]

    const percentage = (pass / all) * 100

    log.info('\n')
    log.info(`--- ${suiteName}, Pass: ${pass}/${all} ${printPercent(percentage)}%`)
    log.info('')

    tests.forEach(test => {
      if (test.pass) {
        log.pass(test)
      }
      else {
        log.fail(test)
      }

      if (test.info) {
        log.annotate(test.info)
      }
    })


    log.info('--------------------------')
  })

  const stats = storage.stats

  suiteNames.forEach(suiteName => {
    const { pass, fail, all, tests } = suites[suiteName]
    const percentage = printPercent((pass / all) * 100)
    log.info(`${suiteName} => Pass: ${pass}/${all} ${percentage}%`)
  })

  const percentage = printPercent(stats.pass / stats.all * 100)
  log(`\n  Ran ${stats.all} tests. Passed ${stats.pass}/${stats.all} ${percentage}%`)

  log('---------------------------')
}

module.exports = {
  add,
  info,
  test,
  set,
  get,
}
