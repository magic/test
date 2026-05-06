import is from '@magic/types'
import type { TestResult } from '../../types.ts'

/**
 * Type guard to check if a value is a TestResult.
 */
export const isTestResult = (obj: unknown): obj is TestResult =>
  is.objectNative(obj) &&
  'result' in obj &&
  'expString' in obj &&
  'msg' in obj &&
  'pass' in obj &&
  'key' in obj
