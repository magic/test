#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import(path.join(__dirname, 'bin/lib/registerLoader.js'))

import { describe, before, after, it } from 'node:test'
import fs from '@magic/fs'
import is from '@magic/types'
import deep from '@magic/deep'

import { maybeInjectMagic } from './bin/lib/index.js'

/**
 * Internal suite type for node-test-runner
 * Uses TestSuite hooks but with TestHooks interface
 * @typedef {Object} RunnerSuite
 * @property {string} name
 * @property {TestItem[]} tests
 * @property {TestHooks} hooks
 */

const cwd = process.cwd()
const testDir = path.join(cwd, 'test')

const EXCLUDED_DIRS = ['node_modules', '.tmp', '.git']
const INCLUDED_EXTENSIONS = ['.js', '.ts', '.mjs']

/** @type {string[]} */
const discoveredFiles = []

/**
 * @param {string} dir
 */
const scanDir = async dir => {
  const exists = await fs.exists(dir)
  if (!exists) return

  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
        await scanDir(fullPath)
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (INCLUDED_EXTENSIONS.includes(ext)) {
        discoveredFiles.push(fullPath)
      }
    }
  }
}

await maybeInjectMagic()

await scanDir(testDir)

discoveredFiles.sort()

/**
 * @param {string} filePath
 * @returns {Promise<Record<string, unknown> | null>}
 */
const extractExport = async filePath => {
  try {
    const mod = await import(filePath)
    return mod
  } catch (e) {
    return null
  }
}

/** @type {((tests: unknown) => void | Promise<void | CleanupFunction>) | null} */
let globalBeforeAll = null
/** @type {((tests: unknown) => void | Promise<void>) | null} */
let globalAfterAll = null

const processSpecialFiles = async () => {
  const filesToProcess = [...discoveredFiles]
  for (const filePath of filesToProcess) {
    const fileName = path.basename(filePath)
    if (fileName === 'beforeAll.js') {
      const mod = await extractExport(filePath)
      if (mod && is.function(mod.default)) {
        globalBeforeAll = /** @type {(tests: unknown) => void | Promise<void>} */ (mod.default)
      }
      discoveredFiles.splice(discoveredFiles.indexOf(filePath), 1)
    } else if (fileName === 'afterAll.js') {
      const mod = await extractExport(filePath)
      if (mod && is.function(mod.default)) {
        globalAfterAll = /** @type {(tests: unknown) => void | Promise<void>} */ (mod.default)
      }
      discoveredFiles.splice(discoveredFiles.indexOf(filePath), 1)
    }
  }
}

await processSpecialFiles()

/**
 * @param {Test} testObj
 * @param {string} filePath
 * @param {number} index
 * @returns {string}
 */
const getTestName = (testObj, filePath, index) => {
  if (testObj.info) return String(testObj.info)
  if (testObj.name) return String(testObj.name)
  if (testObj.fn && typeof testObj.fn === 'function' && testObj.fn.name)
    return String(testObj.fn.name)

  const baseName = path.basename(filePath, path.extname(filePath))
  return `${baseName} ${index + 1}`
}

/**
 * @param {unknown} result
 * @param {unknown} expect
 * @returns {Promise<boolean>}
 */
const runAssertion = async (result, expect) => {
  if (is.promise(expect)) {
    const exp = await expect
    if (result !== true) {
      return exp === result || exp === true
    }
    return exp === true
  }

  if (is.function(expect)) {
    const exp = await expect(result)
    if (result !== true) {
      return exp === result || exp === true
    }
    return exp === true
  }

  if (expect === true) {
    return result === true
  }

  if (expect === false) {
    return result === false
  }

  if (is.undefined(expect)) {
    return result === undefined
  }

  if (is.string(expect) || is.number(expect)) {
    return result === expect
  }

  if (is.array(expect) || is.object(expect)) {
    return deep.equal(result, expect)
  }

  return expect === result
}

/**
 * @param {Test} testObj
 * @param {string} filePath
 * @param {number} index
 * @returns {Promise<TestItem>}
 */
const convertTest = async (testObj, filePath, index) => {
  const testName = getTestName(testObj, filePath, index)

  const testFn = async () => {
    let fn = testObj.fn

    const fnExists = 'fn' in testObj && !is.undefined(testObj.fn)
    if (!fnExists && 'is' in testObj) {
      fn = () => testObj.is
    }

    let result

    if (!fnExists) {
      result = undefined
    } else if (testObj.component) {
      const { mount } = await import(path.join(__dirname, 'lib/svelte/mount.js'))
      let componentFile, componentProps

      if (is.string(testObj.component)) {
        componentFile = String(testObj.component)
        componentProps = testObj.props || {}
      } else if (is.array(testObj.component)) {
        componentFile = /** @type {string} */ (testObj.component[0])
        componentProps = /** @type {ComponentProps} */ (testObj.component[1]) || {}
      }

      const { target, component, unmount } = await mount(componentFile, { props: componentProps })
      try {
        if (is.function(fn)) {
          result = await fn({ target, component, unmount })
        }
      } finally {
        await unmount()
      }
    } else if (is.promise(fn)) {
      result = await fn
    } else if (is.function(fn)) {
      result = await fn()
    } else {
      result = fn
    }

    const hasExpect = 'expect' in testObj
    const expect = hasExpect ? testObj.expect : true
    const pass = await runAssertion(result, expect)

    if (!pass) {
      throw new Error(`Expected: ${JSON.stringify(expect)}\nGot: ${JSON.stringify(result)}`)
    }
  }

  return {
    name: testName,
    fn: testFn,
    before: testObj.before,
    after: testObj.after,
  }
}

/**
 * @param {unknown} tests
 * @param {string} filePath
 * @returns {Promise<TestItem[]>}
 */
const convertSuite = async (tests, filePath) => {
  if (!tests) return []

  if (is.function(tests)) {
    const result = await tests({})
    if (result) {
      return convertSuite(result, filePath)
    }
    return []
  }

  if (is.array(tests)) {
    /** @type {TestItem[]} */
    const converted = []
    for (let i = 0; i < tests.length; i++) {
      const testObj = tests[i]
      if (testObj && is.object(testObj)) {
        const convertedTest = await convertTest(/** @type {Test} */ (testObj), filePath, i)
        if (convertedTest) {
          converted.push(convertedTest)
        }
      }
    }
    return converted
  }

  if (is.objectNative(tests)) {
    const entries = Object.entries(tests)
    /** @type {TestItem[]} */
    const converted = []

    for (const [key, value] of entries) {
      if (
        key === 'beforeAll' ||
        key === 'afterAll' ||
        key === 'beforeEach' ||
        key === 'afterEach'
      ) {
        continue
      }

      if (is.function(value)) {
        const result = await value()
        if (is.array(result)) {
          const arrTests = await convertSuite(result, filePath)
          converted.push(...arrTests)
        }
      } else if (is.array(value)) {
        const arrTests = await convertSuite(value, filePath)
        converted.push(...arrTests)
      } else if (is.objectNative(value)) {
        const objTests = await convertSuite(value, filePath)
        converted.push(...objTests)
      }
    }

    return converted
  }

  return []
}

/**
 * @param {string} filePath
 * @returns {Promise<RunnerSuite[]>}
 */
const processFile = async filePath => {
  const mod = await extractExport(filePath)

  if (!mod) return []

  const fileName = path.basename(filePath)

  if (mod === undefined || mod === null) return []

  /** @type {RunnerSuite[]} */
  const suites = []

  if (mod.default) {
    const suiteName = fileName.replace(/\.(js|ts|mjs)$/, '')
    const tests = await convertSuite(mod.default, filePath)

    if (tests.length > 0) {
      suites.push({ name: suiteName, tests, hooks: mod.default })
    }
  }

  const namedExports = Object.keys(mod).filter(k => k !== 'default')
  for (const exportName of namedExports) {
    const exportValue = mod[exportName]
    const tests = await convertSuite(exportValue, filePath)

    if (tests.length > 0) {
      suites.push({
        name: `${fileName.replace(/\.(js|ts|mjs)$/, '')}_${exportName}`,
        tests,
        hooks: /** @type {TestHooks} */ (exportValue),
      })
    }
  }

  return suites
}

const run = async () => {
  /** @type {RunnerSuite[]} */
  const allSuites = []

  for (const filePath of discoveredFiles) {
    const suites = await processFile(filePath)
    allSuites.push(...suites)
  }

  /** @type {CleanupFunction | undefined} */
  let beforeAllGlobalCleanup = undefined

  if (globalBeforeAll) {
    const beforeAllResult = globalBeforeAll(allSuites)
    if (is.function(beforeAllResult)) {
      beforeAllGlobalCleanup = () => {
        /** @type {Function} */ beforeAllResult()
      }
    } else if (beforeAllResult && is.function(beforeAllResult.then)) {
      await beforeAllResult
    }
  }

  for (const suite of allSuites) {
    /** @type {TestHooks} */
    const hooks = /** @type {TestHooks} */ (suite.hooks) || {}

    describe(suite.name, () => {
      /** @type {CleanupFunction | null} */
      let beforeAllCleanup = null

      if (hooks.beforeAll && is.function(hooks.beforeAll)) {
        before(async () => {
          const result = await /** @type {SuiteHookWithArg} */ (hooks.beforeAll)(allSuites)
          if (result && is.function(result)) {
            beforeAllCleanup = /** @type {CleanupFunction} */ (result)
          }
          return undefined
        })
      }

      if (hooks.afterAll && is.function(hooks.afterAll)) {
        after(async () => {
          await /** @type {SuiteHookWithArg} */ (hooks.afterAll)(allSuites)
        })
      }

      if (hooks.beforeAll && is.function(hooks.beforeAll)) {
        after(async () => {
          if (beforeAllCleanup && is.function(beforeAllCleanup)) {
            await beforeAllCleanup()
          }
        })
      }

      for (const testObj of suite.tests) {
        it(testObj.name, async () => {
          let testAfter

          if (testObj.before && is.function(testObj.before)) {
            const result = await testObj.before(testObj)
            if (is.function(result)) {
              testAfter = /** @type {CleanupFunction} */ (result)
            }
          }

          try {
            await testObj.fn()
          } finally {
            if (testAfter) {
              testAfter()
            }

            if (testObj.after) {
              testObj.after()
            }
          }
        })
      }
    })
  }

  after(async () => {
    if (beforeAllGlobalCleanup) {
      await beforeAllGlobalCleanup()
    }

    if (globalAfterAll) {
      await globalAfterAll(allSuites)
    }

    const tmpDir = path.join(cwd, 'test', '.tmp')
    const exists = await fs.exists(tmpDir)
    if (exists) {
      fs.rmrf(tmpDir)
    }
  })
}

run()

export default run
