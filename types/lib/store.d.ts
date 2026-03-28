export class Store {
  /** @type {State} */
  state: State
  /**
   * Set values in the store state
   * @param {Partial<State>} val - Values to set
   */
  set(val: Partial<State>): void
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
  get<T>(key: string, def?: T | undefined): T | undefined
  /**
   * Reset the store state to default
   */
  reset(): void
}
export function createStore(): Store
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
