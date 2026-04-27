var __rewriteRelativeImportExtension =
  (this && this.__rewriteRelativeImportExtension) ||
  function (path, preserveJsx) {
    if (typeof path === 'string' && /^\.\.?\//.test(path)) {
      return path.replace(
        /\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,
        function (m, tsx, d, ext, cm) {
          return tsx
            ? preserveJsx
              ? '.jsx'
              : '.js'
            : d && (!ext || !cm)
              ? m
              : d + ext + '.' + cm.toLowerCase() + 'js'
        },
      )
    }
    return path
  }
import { parentPort, workerData } from 'node:worker_threads'
import is from '@magic/types'
import { cleanError, cleanFunctionString, getTestKey } from '../lib/index.js'
import { restoreFromSnapshot, isolation } from './isolation.js'
import { getViteDefine } from '../lib/svelte/viteConfig/index.js'
import '../bin/lib/registerLoader.js'
/**
 * Type guard to check if an object has test properties (fn or tests).
 */
const hasTestProperties = obj => {
  return is.objectNative(obj) && ('fn' in obj || 'tests' in obj)
}
/**
 * Convert a value to a structuredClone-safe representation.
 * Tries to keep the value as-is if it's cloneable; otherwise reduces to a string/primitive.
 */
const makeSafe = value => {
  try {
    // Quick path: primitives are safe
    if (value === null || !is.object(value)) {
      return value
    }
    // Functions cannot be cloned
    if (is.function(value)) {
      return value.toString()
    }
    // Attempt a structured clone to verify cloneability
    structuredClone(value)
    return value
  } catch {
    // Fallback: convert to a string representation (or keep undefined/null)
    if (value === undefined || value === null) return value
    if (
      is.string(value) ||
      is.number(value) ||
      is.boolean(value) ||
      value instanceof BigInt ||
      is.symbol(value)
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
const importFile = async filePath => {
  try {
    const defines = await getViteDefine(filePath)
    for (const [key, value] of Object.entries(defines)) {
      // @ts-expect-error - dynamic globalThis property assignment
      globalThis[key] = value
    }
    const mod = await import(__rewriteRelativeImportExtension(filePath))
    if (mod && mod.default) {
      return mod.default
    }
    return mod
  } catch (err) {
    const error = is.error(err) ? err : new Error(String(err))
    error.message = `Failed to import test file: ${filePath}\n${error.message}`
    throw error
  }
}
const runTestFn = async (test, key) => {
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
        const evalResult = await evaluateResult(res, expect)
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
const runSingleTest = async (test, testKey, testPkg, testParent, testName) => {
  const { fn, info } = test
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
    const testResult = await runTestFn(test, testKey)
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
const runSingleTestFromFile = async (tests, testIndex, testPkg, testParent, testName) => {
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
  return runSingleTest(enriched, key, testPkg, testParent, testName)
}
const main = async () => {
  const batchMode = workerData.batchMode === true
  if (batchMode) {
    await runBatchMode()
  } else {
    await runSingleMode()
  }
}
const runSingleMode = async () => {
  const { testFileUrl, testIndex, testPkg, testParent, testName, suiteSnapshot } = workerData
  try {
    if (suiteSnapshot) {
      restoreFromSnapshot(suiteSnapshot)
    }
    const tests = await importFile(testFileUrl)
    let afterAllCleanup
    if (is.objectNative(tests) && is.function(tests.beforeAll)) {
      const result = await tests.beforeAll()
      if (is.function(result)) {
        afterAllCleanup = result
      }
    }
    let result
    try {
      result = await runSingleTestFromFile(tests, testIndex, testPkg, testParent, testName)
    } finally {
      if (afterAllCleanup) {
        await afterAllCleanup()
      }
      if (is.objectNative(tests) && is.function(tests.afterAll)) {
        await tests.afterAll()
      }
    }
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
        error: cleanError(is.error(e) ? e : new Error(String(e))),
      })
  }
}
const runBatchMode = async () => {
  const { testFileUrl, testIndices, testPkg, testParent, testNames, suiteSnapshot } = workerData
  try {
    if (suiteSnapshot) {
      restoreFromSnapshot(suiteSnapshot)
    }
    const tests = await importFile(testFileUrl)
    let afterAllCleanup
    if (is.objectNative(tests) && is.function(tests.beforeAll)) {
      const result = await tests.beforeAll()
      if (is.function(result)) {
        afterAllCleanup = result
      }
    }
    const results = []
    try {
      for (let i = 0; i < testIndices.length; i++) {
        const testIndex = testIndices[i]
        const testName = testNames[i]
        const result = await runSingleTestFromFile(tests, testIndex, testPkg, testParent, testName)
        results.push({
          ...result,
          result: makeSafe(result.result),
        })
      }
    } finally {
      if (afterAllCleanup) {
        await afterAllCleanup()
      }
      if (is.objectNative(tests) && is.function(tests.afterAll)) {
        await tests.afterAll()
      }
    }
    if (parentPort) parentPort.postMessage(results)
  } catch (e) {
    if (parentPort) {
      const results = testNames.map(testName => ({
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
        error: cleanError(is.error(e) ? e : new Error(String(e))),
      }))
      parentPort.postMessage(results)
    }
  }
}
main()
