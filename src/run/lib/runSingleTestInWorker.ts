import is from '@magic/types'

import { cleanFunctionString } from '#src/lib/index.js'
import type { WrappedTest, TestResult } from '#src/types.js'

import { createFailResult } from './createFailResult.ts'
import { runTestFnInWorker } from './runTestFnInWorker.ts'

export const runSingleTestInWorker = async (
  test: WrappedTest,
  testKey: string,
  testPkg: string,
  testParent: string,
  testName: string,
): Promise<TestResult> => {
  const { fn, info } = test

  if (!is.ownProp(test, 'fn')) {
    return createFailResult({ ...test, key: testKey })
  }

  const msg = cleanFunctionString(fn)

  let result
  let exp
  let expString
  let pass = false

  try {
    const testResult = await runTestFnInWorker(test, testKey)
    result = testResult.result
    pass = testResult.pass
    exp = testResult.exp
    expString = testResult.expString
  } catch {
    // Error already logged by inner functions
  }

  return {
    result,
    msg,
    pass,
    parent: testParent || '',
    name: testName,
    expect: exp,
    expString,
    key: testKey,
    info,
    pkg: testPkg,
  }
}
