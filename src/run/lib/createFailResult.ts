import is from '@magic/types'
import type { WrappedTest, TestResult } from '#src/types.js'
import { getTestKey, toCleanError } from '#src/lib/index.js'

/**
 * Create a failure result. Optionally attach a cleaned error.
 */
export const createFailResult = (
  testToRun: WrappedTest,
  errorArg?: unknown,
): TestResult & { error?: unknown } => {
  const result: Record<string, unknown> = {
    result: undefined,
    msg: '',
    pass: false,
    parent: testToRun.parent || '',
    name: testToRun.name,
    expect: undefined,
    expString: undefined,
    key: testToRun.key || getTestKey(testToRun.pkg, testToRun.parent, testToRun.name),
    info: testToRun.info || '',
    pkg: testToRun.pkg,
  }
  if (errorArg !== undefined) {
    result.error = toCleanError(errorArg)
  }
  return result as unknown as TestResult & { error?: unknown }
}
