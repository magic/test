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
    // Merge entire state object for efficiency
    this.state = { ...this.state, ...val }
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
