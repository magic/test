import is from '@magic/types'

import { getTestKey } from '../../lib/index.ts'
import type { WrappedTest, TestResult } from '../../types.ts'

import { hasTestProperties } from './hasTestProperties.ts'
import { runSingleTestInWorker } from './runSingleTestInWorker.ts'

export const runSingleTestFromFileInWorker = async (
  tests: unknown,
  testIndex: number,
  testPkg: string,
  testParent: string,
  testName: string,
): Promise<TestResult> => {
  let test: WrappedTest | undefined

  // Handle object format: { beforeAll, tests: [...] }
  if (is.objectNative(tests) && 'tests' in tests && is.array((tests as { tests: unknown }).tests)) {
    const testArray = (tests as { tests: WrappedTest[] }).tests
    if (testArray[testIndex] != null && hasTestProperties(testArray[testIndex])) {
      test = testArray[testIndex] as WrappedTest
    }
  } else if (is.array(tests)) {
    // Handle array format: [...]
    const arr = tests as unknown[]
    if (arr[testIndex] != null && hasTestProperties(arr[testIndex])) {
      test = arr[testIndex] as WrappedTest
    }
  } else if (hasTestProperties(tests)) {
    test = tests as WrappedTest
  }

  if (!test) {
    return {
      result: undefined,
      msg: '',
      pass: false,
      parent: testParent || '',
      name: testName,
      expect: undefined,
      expString: undefined,
      key: getTestKey(testPkg, testParent, testName),
      info: '',
      pkg: testPkg,
    }
  }

  const enriched = {
    ...test,
    name: test.name || testName,
    parent: test.parent || testParent,
    pkg: test.pkg || testPkg,
  }

  const key = getTestKey(testPkg, testParent, testName)
  return runSingleTestInWorker(enriched, key, testPkg, testParent, testName)
}
