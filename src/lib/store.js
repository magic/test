import is from '@magic/types'

/**
 * @typedef {Object} Stats
 * @property {number} all - Total number of tests
 * @property {number} pass - Number of passing tests
 * @property {number} fail - Number of failing tests
 */

/**
 * @typedef {Object} StateBase
 * @property {Record<string, any>} suites - Test suites
 * @property {Stats} stats - Test statistics
 * @property {string} pkg - Package name
 * @property {[number, number]} [startTime] - Start time timestamp
 * @property {Record<string, any>} [results] - Test results
 */

/**
 * @typedef {StateBase & Record<string, any>} State
 * State object with known properties and index signature for dynamic properties
 */

/**
 * @type {State}
 */
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
  // make sure we get a copy by destructuring
  state: /** @type {State} */ ({ ...defaultState }),

  /**
   * Set values in the store state
   * @param {Partial<State>} val - Values to set
   */
  set(val) {
    Object.entries(val).forEach(([key, val]) => {
      if (is.objectNative(val)) {
        store.state[key] = { ...store.state[key], ...val }
      } else {
        store.state[key] = val
      }
    })
  },

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
      /* @ts-ignore - the types above express this return, typescript does not understand though. */
      return store.state
    }
    return is.ownProp(store.state, key) ? store.state[key] : def
  },

  /**
   * Reset the store state to default
   */
  reset() {
    store.state = { ...defaultState }
  },
}
