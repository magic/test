import { parentPort, workerData } from 'node:worker_threads'

import is from '@magic/types'

import { cleanError, cleanFunctionString, getTestKey, ERRORS } from '../lib/index.js'
import { isolation, restoreFromSnapshot } from './isolation.js'

/**
 * Convert a value to a structuredClone-safe representation.
 * Tries to keep the value as-is if it's cloneable; otherwise reduces to a string/primitive.
 * @param {any} value
 * @returns {any}
 */
const makeSafe = value => {
  try {
    // Quick path: primitives are safe
    if (value === null || typeof value !== 'object') {
      return value
    }
    // Functions cannot be cloned
    if (typeof value === 'function') {
      return value.toString()
    }
    // Attempt a structured clone to verify cloneability
    structuredClone(value)
    return value
  } catch {
    // Fallback: convert to a string representation (or keep undefined/null)
    if (value === undefined || value === null) return value
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint' ||
      typeof value === 'symbol'
    ) {
      return value
    }
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
}

/**
 * @param {unknown} res
 * @param {unknown} expect
 * @returns {Promise<{ pass: boolean, exp: unknown, expString: unknown }>}
 */
const evaluateResult = async (res, expect) => {
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
  } else if (is.promise(expect)) {
    exp = await expect
    expString = expect
  } else {
    exp = expect
    expString = expect
  }

  if (!pass) {
    if (is.undefined(exp)) {
      pass = exp === res
    } else if (is.sameType(exp, res)) {
      pass = is.deep.equal(exp, res)
    }
  }

  return { pass, exp, expString }
}

/**
 * @param {string} filePath
 * @returns {Promise<any>}
 */
const importFile = async filePath => {
  try {
    let mod = await import(filePath)
    if (is.module(mod)) {
      const m = { ...mod }
      if (is.ownProp(m, 'default')) {
        return m.default
      } else {
        return m
      }
    } else {
      return mod
    }
  } catch (err) {
    const error = is.error(err) ? err : new Error(String(err))
    error.message = `Failed to import test file: ${filePath}\n${error.message}`
    throw error
  }
}

/**
 * @param {any} test
 * @param {string} key
 * @returns {Promise<unknown>}
 */
const runTestFn = async (test, key) => {
  const { fn, before, after, expect, runs = 1 } = test

  /** @type {(() => (void | Promise<void>)) | void | undefined} */
  let afterCleanup
  if (is.function(before)) {
    const result = await before(test)
    if (is.function(result)) {
      afterCleanup = result
    }
  }

  let result
  let exp
  let expString
  let pass = false

  const results = []
  for (let i = 0; i < runs; i++) {
    let res
    try {
      if (is.function(fn)) {
        res = await fn()
      } else if (is.promise(fn)) {
        res = await fn
      } else {
        res = fn
      }
    } catch (e) {
      results.push({ res, pass: false })
      continue
    }

    try {
      const evalResult = await evaluateResult(res, expect)
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
    result = runs > 1 ? results.map(r => r.res) : results[0].res
    const lastExp = results[results.length - 1]
    exp = lastExp.exp
    expString = lastExp.expString
  }

  if (is.function(afterCleanup)) {
    try {
      await afterCleanup()
    } catch {
      // ignore cleanup errors
    }
  }

  if (is.function(after)) {
    try {
      await after()
    } catch {
      // ignore after errors
    }
  }

  return { result, pass, exp, expString }
}

/**
 * @param {any} test
 * @param {string} testKey
 * @param {string} testPkg
 * @param {string} testParent
 * @param {string} testName
 * @returns {Promise<import('../app.d.ts').TestResult>}
 */
const runSingleTest = async (test, testKey, testPkg, testParent, testName) => {
  const { fn, expect, info } = test

  if (!is.ownProp(test, 'fn')) {
    return {
      result: undefined,
      msg: '',
      pass: false,
      parent: testParent || '',
      name: testName,
      expect: undefined,
      expString: undefined,
      key: testKey,
      info: info || '',
      pkg: testPkg,
    }
  }

  const msg = cleanFunctionString(fn)

  let result
  let exp
  let expString
  let pass = false

  try {
    const testResult =
      /** @type {{ result: unknown, pass: boolean, exp: unknown, expString: unknown }} */ (
        await runTestFn(test, testKey)
      )
    result = testResult.result
    pass = testResult.pass
    exp = testResult.exp
    expString = testResult.expString
  } catch (e) {
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

/**
 * @param {any[]} tests
 * @param {string} testKey
 * @returns {any | undefined}
 */
const findTestByKey = (tests, testKey) => {
  for (const t of /** @type {any[]} */ (tests)) {
    const key = getTestKey(t.pkg, t.parent, t.name)
    if (key === testKey) return t
  }
  return undefined
}

const main = async () => {
  const { testFileUrl, testIndex, testPkg, testParent, testName, suiteSnapshot } = workerData

  try {
    if (suiteSnapshot) {
      restoreFromSnapshot(suiteSnapshot)
    }

    const tests = await importFile(testFileUrl)

    /** @type {any} */
    let test
    if (is.array(tests)) {
      test = tests[testIndex]
    } else if (is.objectNative(tests)) {
      test = tests
    }

    if (!test) {
      if (parentPort)
        parentPort.postMessage({
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
        })
      return
    }

    // Merge context fields from the worker request into the test
    const enriched = {
      ...test,
      name: test.name || testName,
      parent: test.parent || testParent,
      pkg: test.pkg || testPkg,
    }

    const key = getTestKey(testPkg, testParent, testName)
    const result = await runSingleTest(enriched, key, testPkg, testParent, testName)
    // Sanitize result to ensure it can be sent via postMessage (structured clone)
    // Do NOT sanitize expect - it's used for display and may be a function
    const payload = {
      ...result,
      result: makeSafe(result.result),
    }
    if (parentPort) parentPort.postMessage(payload)
  } catch (e) {
    if (parentPort)
      parentPort.postMessage({
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
        error: cleanError(/** @type {Error} */ (e)),
      })
  }
}

main()
