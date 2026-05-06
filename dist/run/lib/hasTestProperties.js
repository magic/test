import is from '@magic/types'
/**
 * Type guard to check if an object has test properties (fn or tests).
 */
export const hasTestProperties = obj => is.objectNative(obj) && ('fn' in obj || 'tests' in obj)
