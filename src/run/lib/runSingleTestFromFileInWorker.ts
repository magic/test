import is from '@magic/types'

import { getTestKey } from '../../lib/index.js'
import type { WrappedTest, TestResult } from '../../types.js'

import { hasTestProperties } from './hasTestProperties.js'
import { createFailResult } from './createFailResult.js'
import { runSingleTestInWorker } from './runSingleTestInWorker.js'

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
    return createFailResult({
      name: testName,
      parent: testParent || '',
      pkg: testPkg,
    })
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
