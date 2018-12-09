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
    Object.entries(val).forEach(([key, val]) => {
      if (is.object(val)) {
        store.state[key] = Object.assign({}, store.state[key], val)
      } else {
        store.state[key] = val
      }
    })
  },
  get: key => (is.defined(key) ? store.state[key] : store.state),
}

module.exports = store
