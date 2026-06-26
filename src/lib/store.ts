import is from '@magic/types'
import type { State } from '../types.ts'

const defaultState: State = {
  suites: {},
  stats: {
    all: 0,
    pass: 0,
    fail: 0,
  },
  pkg: '',
}

export class Store {
  state: State = { ...defaultState } as State

  /**
   * Set values in the store state
   */
  set(val: Partial<State>): void {
    // Merge entire state object for efficiency
    this.state = { ...this.state, ...val }
  }

  /**
   * Get the entire store state.
   */
  get(): State
  /**
   * Get a value from the store by key, with optional default.
   */
  get<T>(key: string, def?: T): T | undefined
  /**
   * Implementation of get method.
   */
  get<T>(key?: string, def?: T): State | T | undefined {
    if (!key) {
      return this.state as State
    }
    if (is.ownProp(this.state, key)) {
      return this.state[key as keyof State] as T
    }
    return def
  }

  /**
   * Reset the store state to default
   */
  reset(): void {
    this.state = { ...defaultState } as State
  }
}

/**
 * Create a new store instance
 */
export const createStore = () => new Store()
