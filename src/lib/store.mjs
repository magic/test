import is from '@magic/types'

export const defaultState = {
  suites: {},
  stats: {
    all: 0,
    pass: 0,
    fail: 0,
  },
  pkg: '',
}

export const store = {
  state: Object.assign({}, defaultState),
  set: val => {
    Object.entries(val).forEach(([key, val]) => {
      if (is.object(val)) {
        store.state[key] = { ...store.state[key], ...val }
      } else {
        store.state[key] = val
      }
    })
  },
  get: key => (key ? store.state[key] : store.state),
  reset: () => {
    this.state = {}
  },
}

export default store
