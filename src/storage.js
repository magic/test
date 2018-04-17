const is = require('@magic/types')

const store = {
  suites: {},
  stats: {
    all: 0,
    pass: 0,
    fail: 0,
  },
  pkg: '',
}

const set = (key, value) => {
  if (store[key]) {
    store[key] = Object.assign({}, store[key], value)
  }

  store[key] = value
  return store[key]
}

const get = key => store[key]

store.set = set
store.get = get
store.store = store

module.exports = store
