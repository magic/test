const is = require('@magic/types')
const deepMerge = require('./deepMerge')

const defaultState = {
  suites: {},
  stats: {
    all: 0,
    pass: 0,
    fail: 0,
  },
  pkg: '',
}

const store = {
  state: Object.assign({}, defaultState),
  set: val => {
    const entries = Object.entries(val)
    entries.forEach(([key, val]) => {
      if (is.object(val)) {
        store.state[key] = Object.assign({}, store.state[key], val)
      } else {
        store.state[key] = val
      }
    })
    // const st = deepMerge(store.state, val)
    // const s = Object.assign({}, store.state, st)
    // console.log({ s })
  },
  get: key => (is.defined(key) ? store.state[key] : store.state),
}

module.exports = store
