import store from '../store.mjs'

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
