const log = require('@magic/log')

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

const get = key => storage[key]

const add = (key, value) => {
  const data = get(key)

  Object.keys(value).forEach(k => {
    if (typeof data === 'object') {
      if (typeof data[k] === 'number' && typeof value[k] === 'number') {
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
    stats.pass += 1
  } else {
    stat.fail += 1
    stats.fail += 1
  }

  stat.all += 1
  stats.all += 1
  storage.suites[t.key] = stat
  storage.stats = stats
}

const printPercent = p =>
  p === 100 ? log.color('green', p) : log.color('red', p)

const info = results => {
  const suites = storage.suites
  const suiteNames = Object.keys(storage.suites)

  const pkg = storage.module

  log(`###  Testing package: ${pkg}`)

  suiteNames.forEach(suiteName => {
    const { pass, all, tests } = suites[suiteName]

    const percentage = pass / all * 100

    log.info('\n')
    log.info(
      `--- ${suiteName}, Pass: ${pass}/${all} ${printPercent(percentage)}%`,
    )
    log.info('')

    tests.forEach(test => {
      if (test.pass) {
        log.pass(test)
      } else {
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
    const { pass, all } = suites[suiteName]
    const percentage = printPercent(pass / all * 100)
    log.info(`${suiteName} => Pass: ${pass}/${all} ${percentage}%`)
  })

  const percentage = printPercent(stats.pass / stats.all * 100)
  log(
    `\n  Ran ${stats.all} tests. Passed ${stats.pass}/${
      stats.all
    } ${percentage}%`,
  )
}

module.exports = {
  add,
  info,
  test,
  set,
  get,
}
