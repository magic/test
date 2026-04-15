import is from '@magic/types'
/**
 * Type guard to check if a value is a TestResult.
 */
export const isTestResult = obj =>
  is.objectNative(obj) &&
  'result' in obj &&
  'expString' in obj &&
  'msg' in obj &&
  'pass' in obj &&
  'key' in obj
