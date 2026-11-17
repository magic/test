import type { WrappedTest } from '../../types.js'

import is from '@magic/types'

/**
 * Type guard to check if an object has test properties (fn or tests).
 */
export const hasTestProperties = (obj: unknown): obj is WrappedTest =>
  is.objectNative(obj) && ('fn' in obj || 'tests' in obj)
