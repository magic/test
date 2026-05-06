import { getTestKey } from '../../lib/index.ts'
import type { WrappedTest, TestResult } from '../../types.ts'

export const createFailResult = (testToRun: WrappedTest): TestResult => {
  return {
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
}
