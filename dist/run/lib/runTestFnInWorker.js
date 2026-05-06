import is from '@magic/types'
import { cleanError } from '../../lib/index.js'
import { isolation } from '../isolation.js'
import { evaluateWorkerResult } from './evaluateWorkerResult.js'
export const runTestFnInWorker = async (test, key) => {
  const { fn, before, after, expect, runs = 1 } = test
  let afterCleanupError = null
  const isolatedResult = await isolation.executeIsolated(key, async () => {
    let afterCleanup
    let innerAfterCleanupError = null
    let innerAfterError = null
    if (is.function(before)) {
      try {
        const result = await before(test)
        if (is.function(result)) {
          afterCleanup = result
        }
      } catch (e) {
        innerAfterCleanupError = cleanError(is.error(e) ? e : new Error(String(e)))
      }
    }
    let result
    let exp
    let expString
    let pass
    const results = []
    for (let i = 0; i < runs; i++) {
      let res
      try {
        if (is.function(fn)) {
          res = await fn({})
        } else if (is.promise(fn)) {
          res = await fn
        } else {
          res = fn
        }
      } catch {
        results.push({ res: undefined, pass: false })
        continue
      }
      try {
        const evalResult = await evaluateWorkerResult(res, expect)
        const runPass = evalResult.pass
        results.push({ res, pass: runPass, exp: evalResult.exp, expString: evalResult.expString })
        if (!runPass) {
          pass = false
          result = res
          exp = evalResult.exp
          expString = evalResult.expString
        }
      } catch {
        results.push({ res, pass: false })
      }
      try {
        const evalResult = await evaluateWorkerResult(res, expect)
        results.push({
          res,
          pass: evalResult.pass,
          exp: evalResult.exp,
          expString: evalResult.expString,
        })
        if (!evalResult.pass) {
          pass = false
          result = res
          exp = evalResult.exp
          expString = evalResult.expString
        }
      } catch {
        results.push({ res, pass: false })
      }
    }
    pass = results.every(r => r.pass)
    if (pass) {
      result = runs > 1 ? results.map(r => r.res) : results[0]?.res
      const lastExp = results[results.length - 1]
      exp = lastExp?.exp
      expString = lastExp?.expString
    }
    if (is.function(after)) {
      try {
        await after()
      } catch (e) {
        innerAfterError = cleanError(is.error(e) ? e : new Error(String(e)))
      }
    }
    return {
      result,
      pass,
      exp,
      expString,
      afterCleanup,
      afterCleanupError: innerAfterCleanupError,
      afterError: innerAfterError,
    }
  })
  if (isolatedResult.afterCleanup) {
    try {
      await isolatedResult.afterCleanup()
    } catch (e) {
      afterCleanupError = cleanError(is.error(e) ? e : new Error(String(e)))
    }
  }
  return {
    result: isolatedResult.result,
    pass: isolatedResult.pass,
    exp: isolatedResult.exp,
    expString: isolatedResult.expString,
    afterCleanupError: isolatedResult.afterCleanupError || afterCleanupError,
    afterError: isolatedResult.afterError,
  }
}
