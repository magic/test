import is from '@magic/types'
import { getTestKey } from '../../lib/index.js'
import { hasTestProperties } from './hasTestProperties.js'
import { createFailResult } from './createFailResult.js'
import { runSingleTestInWorker } from './runSingleTestInWorker.js'
export const runSingleTestFromFileInWorker = async (
  tests,
  testIndex,
  testPkg,
  testParent,
  testName,
) => {
  let test
  // Handle object format: { beforeAll, tests: [...] }
  if (is.objectNative(tests) && 'tests' in tests && is.array(tests.tests)) {
    const testArray = tests.tests
    if (testArray[testIndex] != null && hasTestProperties(testArray[testIndex])) {
      test = testArray[testIndex]
    }
  } else if (is.array(tests)) {
    // Handle array format: [...]
    const arr = tests
    if (arr[testIndex] != null && hasTestProperties(arr[testIndex])) {
      test = arr[testIndex]
    }
  } else if (hasTestProperties(tests)) {
    test = tests
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
//# sourceMappingURL=runSingleTestFromFileInWorker.js.map
