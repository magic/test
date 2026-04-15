import type { State } from '../types.ts'
export declare class Store {
  state: State
  /**
   * Set values in the store state
   */
  set(val: Partial<State>): void
  /**
   * Get the entire store state.
   */
  get(): State
  /**
   * Get a value from the store by key, with optional default.
   */
  get<T>(key: string, def?: T): T | undefined
  /**
   * Reset the store state to default
   */
  reset(): void
}
/**
 * Create a new store instance
 */
export declare const createStore: () => Store
