import is from '@magic/types'

/**
 * @typedef {Object} StateBase
 * @property {Record<string, unknown>} suites - Test suites
 * @property {Stats} stats - Test statistics
 * @property {string} pkg - Package name
 * @property {[number, number]} [startTime] - Start time timestamp
 * @property {Record<string, unknown>} [results] - Test results
 */

/**
 * @typedef {StateBase & Record<string, unknown>} State
 * State object with known properties and index signature for dynamic properties
 */

/**
 * @type {State}
 */
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
  /** @type {State} */
  state = { ...defaultState }

  /**
   * Set values in the store state
   * @param {Partial<State>} val - Values to set
   */
  set(val) {
    Object.entries(val).forEach(([key, val]) => {
      if (is.objectNative(val)) {
        this.state[key] = { .../** @type {object} */ (this.state[key]), ...val }
      } else {
        this.state[key] = val
      }
    })
  }

  /**
   * Get the entire store state (no key provided)
   * @returns {State}
   */
  /**
   * Get a value from the store state by key
   * @template {keyof StateBase} K
   * @param {K} key - The key to get
   * @param {StateBase[K]} [def] - Default value if key doesn't exist
   * @returns {StateBase[K] | undefined}
   */
  /**
   * Get a value from the store state with custom default type
   * @template T
   * @param {string} key - The key to get
   * @param {T | undefined} [def] - Default value if key doesn't exist
   * @returns {T | undefined}
   */
  get(key, def = undefined) {
    if (!key) {
      return /** @type {T} */ (this.state)
    }
    return is.ownProp(this.state, key) ? /** @type {T | undefined} */ (this.state[key]) : def
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
 * @returns {Store}
 */
export const createStore = () => new Store()
