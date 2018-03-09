const { isDefined, isFalsy, isNumber, isObject } = require('types')
const log = require('./log')

const counter = {}

const deepAdd = (o, o2) => {
  if (isFalsy(o) || isFalsy(o2)) {
    return o
  }

  if (isNumber(o) && isNumber(o2)) {
    o += o2
    return o
  }

  Object.keys(o2).forEach(key => {
    o[key] = deepAdd(o[key], o2[key])
  })

  return o
}

const add = (key, count = 1) => {
  if (!key) {
    return
  }

  if (!isDefined(counter[key])) {
    counter[key] = count
    return
  }

  if (isObject(count)) {
    counter[key] = deepAdd(counter[key], count)
    return
  }

  if (count) {
    counter[key] += count
  }
}

const set = (key, value) => {
  counter[key] = value
}

const get = key => {
  if (key) {
    return counter[key]
  }
  return counter
}

const calculate = () => {
  log('--------\n')
  log.info('Suites:')

  let percentages = 0
  let suites = 0
  let pass = 0
  let all = 0

  Object.keys(counter).forEach(key => {
    const count = counter[key]
    const percentage = (count.pass / count.all) * 100

    if (percentage === 100) {
      log.success(key, `${percentage}%`)
    }
    else {
      log.error(key, percentage)
    }

    percentages += percentage
    pass += count.pass
    all += count.all
    suites += 1
  })

  log(`Percentage pass: ${percentages / suites }% ${pass}/${all}`)
  log('-------')
}

module.exports = {
  counter,
  add,
  get,
  set,
  calculate,
}
