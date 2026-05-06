import is from '@magic/types'
import type { State } from '../types.ts'

const defaultState = {
  suites: {},
  stats: {
    all: 0,
    pass: 0,
    fail: 0,
  },
  pkg: '',
} as const

export class Store {
  state: State = { ...defaultState } as State

  /**
   * Set values in the store state
   */
  set(val: Partial<State>): void {
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
    const keys = Object.keys(val) as (keyof State)[]
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
