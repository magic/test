import type { Store } from '../store.ts'

/**
 * Reset the store to default state.
 */
export const reset = (store: Store): void => {
  store.reset()
}
