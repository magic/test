import { Store } from '../store.ts'
/**
 * Record a test result in the store, updating statistics for the test,
 * its parent, package, and global counters.
 */
export declare const test: (
  t: {
    name: string
    parent?: string
    pass: boolean
    pkg?: string
  },
  store: Store,
) => void
