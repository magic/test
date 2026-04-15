import is from '@magic/types'
const defaultState = {
  suites: {},
  stats: {
    all: 0,
    pass: 0,
    fail: 0,
  },
  pkg: '',
}
export class Store {
  state = { ...defaultState }
  /**
   * Set values in the store state
   */
  set(val) {
    if (val.suites) {
      this.state.suites = { ...this.state.suites, ...val.suites }
    }
    if (val.stats) {
      this.state.stats = val.stats
    }
    if (val.pkg !== undefined) {
      this.state.pkg = val.pkg
    }
    if (val.startTime !== undefined) {
      this.state.startTime = val.startTime
    }
    if (val.results !== undefined) {
      this.state.results = val.results
    }
    // Allow setting arbitrary keys on state
    const keys = Object.keys(val)
    for (const key of keys) {
      if (
        key !== 'suites' &&
        key !== 'stats' &&
        key !== 'pkg' &&
        key !== 'startTime' &&
        key !== 'results'
      ) {
        this.state[key] = val[key]
      }
    }
  }
  /**
   * Implementation of get method.
   */
  get(key, def) {
    if (!key) {
      return this.state
    }
    if (is.ownProp(this.state, key)) {
      return this.state[key]
    }
    return def
  }
  /**
   * Reset the store state to default
   */
  reset() {
    this.state = { ...defaultState }
  }
}
/**
 * Create a new store instance
 */
export const createStore = () => new Store()
