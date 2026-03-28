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
export type StateBase = {
  /**
   * - Test suites
   */
  suites: Record<string, unknown>
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
  results?: Record<string, unknown> | undefined
}
/**
 * State object with known properties and index signature for dynamic properties
 */
export type State = StateBase & Record<string, unknown>
//# sourceMappingURL=store.d.ts.map
