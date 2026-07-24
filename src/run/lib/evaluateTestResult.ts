import is from '@magic/types'

import { cleanFunctionString } from '../../lib/index.ts'
import type { EvaluateResult } from '../../types.ts'

/**
 * Evaluate test result against expected value
 */
export const evaluateTestResult = async (
  res: unknown,
  expect: unknown,
): Promise<EvaluateResult> => {
  let exp
  let expString
  let pass = false

  if (is.function(expect)) {
    const combinedRes = [res]
    if (combinedRes.length > 1) {
      res = combinedRes
    }
    exp = await expect(res)
    expString = cleanFunctionString(expect)
    if (res !== true) {
      pass = exp === res || exp === true
    }
  } else if (Array.isArray(expect)) {
    const hasPredicates = expect.some(f => typeof f === 'function')
    if (hasPredicates) {
      expString = expect
      const results: boolean[] = []
      for (const e of expect) {
        if (typeof e === 'function') {
          results.push(Boolean(await e(res)))
        } else if (e === null || is.undefined(e)) {
          results.push(e === res)
        } else if (typeof e !== 'object') {
          results.push(e === res)
        } else {
          results.push(is.deep.equal(e, res))
        }
      }
      exp = results
      pass = results.every(Boolean)
    } else {
      exp = expect
      expString = expect
    }
  } else if (is.promise(expect)) {
    exp = await expect
    expString = expect
  } else {
    exp = expect
    expString = expect
  }

  if (!pass) {
    // Handle explicit boolean expectations first
    if (exp === true) {
      pass = res === true
    } else if (exp === false) {
      pass = res === false
    } else if (is.undefined(exp) || is.null(exp)) {
      // null/undefined expectations must match exactly (function returned falsy)
      pass = exp === res
    } else if (is.string(exp) || is.number(exp)) {
      // Primitives: strict equality
      pass = exp === res
    } else if (is.sameType(exp, res)) {
      // Complex types: deep equality
      pass = is.deep.equal(exp, res)
    }
  }

  return { pass, exp, expString }
}
