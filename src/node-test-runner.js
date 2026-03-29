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

/** @type {((tests: unknown) => void | Promise<void>) | null} */
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
 * @param {unknown} testObj
 * @param {string} filePath
 * @param {number} index
 * @returns {string}
 */
const getTestName = (testObj, filePath, index) => {
  const obj = /** @type {Record<string, unknown>} */ (testObj)
  if (obj.info) return String(obj.info)
  if (obj.name) return String(obj.name)
  if (obj.fn && /** @type {Record<string, unknown>} */ (obj.fn).name)
    return String(/** @type {Record<string, unknown>} */ (obj.fn).name)

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
 * @param {unknown} testObj
 * @param {string} filePath
 * @param {number} index
 * @returns {Promise<{name: string, fn: () => Promise<void>, before?: () => void | Promise<void>}>}
 */
const convertTest = async (testObj, filePath, index) => {
  const obj = /** @type {Record<string, unknown>} */ (testObj)
  const testName = getTestName(testObj, filePath, index)

  const testFn = async () => {
    let fn = obj.fn

    const fnExists = 'fn' in obj && !is.undefined(obj.fn)
    if (!fnExists && 'is' in obj) {
      fn = () => obj.is
    }

    let result

    if (!fnExists) {
      result = undefined
    } else if (obj.component) {
      const { mount } = await import(path.join(__dirname, 'lib/svelte/mount.js'))
      let componentFile, componentProps

      if (is.string(obj.component)) {
        componentFile = String(obj.component)
        componentProps = /** @type {Record<string, unknown>} */ (obj.props) || {}
      } else if (is.array(obj.component)) {
        componentFile = /** @type {string} */ (obj.component[0])
        componentProps = /** @type {Record<string, unknown>} */ (obj.component[1]) || {}
      }

      const { target, component, unmount } = await mount(componentFile, { props: componentProps })
      try {
        result = await /** @type {Function} */ (fn)({ target, component, unmount })
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

    const hasOwnProperty = Object.prototype.hasOwnProperty.call(obj, 'expect')
    const expect = hasOwnProperty ? obj.expect : true
    const pass = await runAssertion(result, expect)

    if (!pass) {
      throw new Error(`Expected: ${JSON.stringify(expect)}\nGot: ${JSON.stringify(result)}`)
    }
  }

  return {
    name: testName,
    fn: testFn,
    before: /** @type {() => void | Promise<void>} */ (obj.before),
  }
}

/**
 * @param {unknown} tests
 * @param {string} filePath
 * @returns {Promise<{name: string, fn: () => Promise<void>}[]>}
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
    /** @type {{name: string, fn: () => Promise<void>}[]} */
    const converted = []
    for (let i = 0; i < tests.length; i++) {
      const testObj = tests[i]
      if (testObj && is.object(testObj)) {
        const convertedTest = await convertTest(testObj, filePath, i)
        if (convertedTest) {
          converted.push(convertedTest)
        }
      }
    }
    return converted
  }

  if (is.objectNative(tests)) {
    const entries = Object.entries(tests)
    /** @type {{name: string, fn: () => Promise<void>}[]} */
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
 * @returns {Promise<{name: string, tests: {name: string, fn: () => Promise<void>, before?: () => void | Promise<void>}[], hooks: TestHooks}[]>}
 */
const processFile = async filePath => {
  const mod = await extractExport(filePath)

  if (!mod) return []

  const fileName = path.basename(filePath)

  if (mod === undefined || mod === null) return []

  /** @type {{name: string, tests: {name: string, fn: () => Promise<void>}[], hooks: TestHooks}[]} */
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
  /** @type {{name: string, tests: {name: string, fn: () => Promise<void>, before?: () => void | Promise<void>}[], hooks: TestHooks}[]} */
  const allSuites = []

  for (const filePath of discoveredFiles) {
    const suites = await processFile(filePath)
    allSuites.push(...suites)
  }

  /** @type {unknown} */
  let beforeAllGlobalCleanup = null

  if (globalBeforeAll) {
    const result = await globalBeforeAll(allSuites)
    if (is.function(result)) {
      beforeAllGlobalCleanup = result
    }
  }

  for (const suite of allSuites) {
    const hooks = suite.hooks || {}

    describe(suite.name, () => {
      /** @type {(() => void | Promise<void>) | null} */
      let beforeAllCleanup = null

      if (hooks.beforeAll && is.function(hooks.beforeAll)) {
        before(async () => {
          const result = await /** @type {(...args: unknown[]) => unknown} */ (hooks.beforeAll)(
            allSuites,
          )
          if (result && is.function(result)) {
            beforeAllCleanup = /** @type {() => void | Promise<void>} */ (result)
          }
          return undefined
        })
      }

      if (hooks.afterAll && is.function(hooks.afterAll)) {
        after(async () => {
          await /** @type {(...args: unknown[]) => unknown} */ (hooks.afterAll)(allSuites)
        })
      }

      if (hooks.beforeAll && is.function(hooks.beforeAll)) {
        after(async () => {
          if (beforeAllCleanup && is.function(beforeAllCleanup)) {
            await /** @type {(...args: unknown[]) => unknown} */ (beforeAllCleanup)()
          }
        })
      }

      for (const testObj of suite.tests) {
        it(testObj.name, async () => {
          const testBefore = testObj.before
          let testAfter

          if (testBefore && is.function(testBefore)) {
            const result = testBefore()
            if (is.function(result)) {
              testAfter = result
            }
          }

          try {
            await testObj.fn()
          } finally {
            if (testAfter && is.function(testAfter)) {
              testAfter()
            }
          }
        })
      }
    })
  }

  if (globalAfterAll && is.function(globalAfterAll)) {
    const afterAllFn = globalAfterAll
    after(async () => {
      await afterAllFn(allSuites)
    })
  }

  if (beforeAllGlobalCleanup) {
    const cleanupFn = /** @type {() => void | Promise<void>} */ (beforeAllGlobalCleanup)
    after(async () => {
      await cleanupFn()
    })
  }

  after(async () => {
    const tmpDir = path.join(cwd, 'test', '.tmp')
    const exists = await fs.exists(tmpDir)
    if (exists) {
      fs.rmrf(tmpDir)
    }
  })
}

run()

export default run
