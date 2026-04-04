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
    Object.entries(val).forEach(([key, value]) => {
      const stateKey = key as keyof State
      if (is.objectNative(value)) {
        const existing = this.state[stateKey]
        if (is.objectNative(existing)) {
          this.state[stateKey] = { ...(existing as object), ...(value as object) } as any
        } else {
          this.state[stateKey] = value as any
        }
      } else {
        this.state[stateKey] = value as any
      }
    })
  }

  /**
   * Get a value from the store by key.
   */
  get<T>(key: string, def?: T): T | undefined {
    return is.ownProp(this.state, key) ? (this.state[key as keyof State] as T | undefined) : def
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
