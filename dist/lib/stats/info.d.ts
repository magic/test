import { Store } from '../store.js'
import type { Suite } from '../../types.js'
/**
 * Prints test results for a package and its suites.
 */
export declare const info: (suites: Suite[], store: Store, useLogging?: boolean) => boolean
