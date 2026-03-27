#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import(path.join(__dirname, 'bin/lib/registerLoader.js'))

import { test, describe, before, after, beforeEach, afterEach, it } from 'node:test'
import fs from 'node:fs'
import is from '@magic/types'
import deep from '@magic/deep'

const cwd = process.cwd()
const testDir = path.join(cwd, 'test')

const EXCLUDED_DIRS = ['node_modules', '.tmp', '.git']
const INCLUDED_EXTENSIONS = ['.js', '.ts', '.mjs']

/** @type {string[]} */
const discoveredFiles = []

/**
 * @param {string} dir
 */
const scanDir = dir => {
  if (!fs.existsSync(dir)) return

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
        scanDir(fullPath)
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (INCLUDED_EXTENSIONS.includes(ext)) {
        discoveredFiles.push(fullPath)
      }
    }
  }
}

scanDir(testDir)

discoveredFiles.sort()

/**
 * @param {string} filePath
 * @returns {Promise<any>}
 */
const extractExport = async filePath => {
  try {
    const mod = await import(filePath)
    return mod
  } catch (e) {
    return null
  }
}

/**
 * @param {any} testObj
 * @param {string} filePath
 * @param {number} index
 * @returns {string}
 */
const getTestName = (testObj, filePath, index) => {
  if (testObj.info) return testObj.info
  if (testObj.name) return testObj.name
  if (testObj.fn && testObj.fn.name) return testObj.fn.name

  const baseName = path.basename(filePath, path.extname(filePath))
  return `${baseName} ${index + 1}`
}

/**
 * @param {any} result
 * @param {any} expect
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
 * @param {any} testObj
 * @param {string} filePath
 * @param {number} index
 * @returns {Promise<{name: string, fn: () => Promise<void>, before?: Function}>}
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
        componentFile = testObj.component
        componentProps = testObj.props || {}
      } else if (is.array(testObj.component)) {
        componentFile = testObj.component[0]
        componentProps = testObj.component[1] || {}
      }

      const { target, component, unmount } = await mount(componentFile, { props: componentProps })
      try {
        result = await fn({ target, component, unmount })
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

    const hasOwnProperty = Object.prototype.hasOwnProperty.call(testObj, 'expect')
    const expect = hasOwnProperty ? testObj.expect : true
    const pass = await runAssertion(result, expect)

    if (!pass) {
      throw new Error(`Expected: ${JSON.stringify(expect)}\nGot: ${JSON.stringify(result)}`)
    }
  }

  return { name: testName, fn: testFn, before: testObj.before }
}

/**
 * @param {any} tests
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
 * @returns {Promise<{name: string, tests: {name: string, fn: () => Promise<void>, before?: Function}[], hooks: any}[]>}
 */
const processFile = async filePath => {
  const mod = await extractExport(filePath)

  if (!mod) return []

  const fileName = path.basename(filePath)

  if (mod === undefined || mod === null) return []

  /** @type {{name: string, tests: {name: string, fn: () => Promise<void>}[], hooks: any}[]} */
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
        hooks: exportValue,
      })
    }
  }

  return suites
}

const run = async () => {
  /** @type {{name: string, tests: {name: string, fn: () => Promise<void>, before?: Function}[], hooks: any}[]} */
  const allSuites = []
  /** @type {any} */
  let beforeAllHook = null
  /** @type {any} */
  let afterAllHook = null
  /** @type {any} */
  let beforeAllTests = null

  for (const filePath of discoveredFiles) {
    const fileName = path.basename(filePath)

    if (fileName === 'beforeAll.js') {
      const mod = await extractExport(filePath)
      if (mod && is.function(mod.default)) {
        beforeAllHook = mod.default
      }
      continue
    }

    if (fileName === 'afterAll.js') {
      const mod = await extractExport(filePath)
      if (mod && is.function(mod.default)) {
        afterAllHook = mod.default
      }
      continue
    }

    const suites = await processFile(filePath)
    allSuites.push(...suites)
  }

  if (beforeAllHook) {
    beforeAllTests = await beforeAllHook(allSuites)
  }

  for (const suite of allSuites) {
    const hooks = suite.hooks || {}

    describe(suite.name, () => {
      if (hooks.beforeAll && is.function(hooks.beforeAll)) {
        before(async () => {
          const result = await hooks.beforeAll(allSuites)
          if (result && is.function(result)) {
            return result
          }
        })
      }

      if (hooks.afterAll && is.function(hooks.afterAll)) {
        after(async () => {
          await hooks.afterAll(allSuites)
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

  if (afterAllHook && is.function(afterAllHook)) {
    after(async () => {
      await afterAllHook(allSuites)
    })
  }
}

run()

export default run
