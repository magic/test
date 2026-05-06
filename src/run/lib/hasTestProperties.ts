import is from '@magic/types'
import type { WrappedTest } from '../../types.ts'

/**
 * Type guard to check if an object has test properties (fn or tests).
 */
export const hasTestProperties = (obj: unknown): obj is WrappedTest =>
  is.objectNative(obj) && ('fn' in obj || 'tests' in obj)
