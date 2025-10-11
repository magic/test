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
export const defaultState: State
export namespace store {
  let state: State
  /**
   * Set values in the store state
   * @param {Partial<State>} val - Values to set
   */
  function set(val: Partial<State>): void
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
  function get<T>(key: string, def?: T | undefined): T | undefined
  /**
   * Reset the store state to default
   */
  function reset(): void
}
export type Stats = {
  /**
   * - Total number of tests
   */
  all: number
  /**
   * - Number of passing tests
   */
  pass: number
  /**
   * - Number of failing tests
   */
  fail: number
}
export type StateBase = {
  /**
   * - Test suites
   */
  suites: Record<string, any>
  /**
   * - Test statistics
   */
  stats: Stats
  /**
   * - Package name
   */
  pkg: string
  /**
   * - Start time timestamp
   */
  startTime?: [number, number] | undefined
  /**
   * - Test results
   */
  results?: Record<string, any> | undefined
}
/**
 * State object with known properties and index signature for dynamic properties
 */
export type State = StateBase & Record<string, any>
//# sourceMappingURL=store.d.ts.map
