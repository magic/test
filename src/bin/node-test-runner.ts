#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import(path.join(__dirname, 'lib/registerLoader.ts'))

import { describe, before, after, it } from 'node:test'
import fs from '@magic/fs'
import is from '@magic/types'
import { maybeInjectMagic } from './lib/index.js'

import type {
  WrappedTest,
  TestHooks,
  TestItem,
  CleanupFunction,
  SuiteHookWithArg,
  ComponentProps,
} from '../types.ts'

/**
 * Internal suite type for node-test-runner
 */
export interface RunnerSuite {
  name: string
  tests: TestItem[]
  hooks: TestHooks | Record<string, unknown>
}

const cwd = process.cwd()
const testDir = path.join(cwd, 'test')

const EXCLUDED_DIRS = ['node_modules', '.tmp', '.git']
const INCLUDED_EXTENSIONS = ['.js', '.ts', '.mjs']

const discoveredFiles: string[] = []

// Ordered lists matching run.ts - hooks run in this order
const BEFORE_ALL_FILES = [
  '/beforeAll.mjs',
  '/beforeall.mjs',
  '/beforeAll.js',
  '/beforeall.js',
  '/beforeAll.ts',
  '/beforeall.ts',
]

const AFTER_ALL_FILES = [
  '/afterAll.mjs',
  '/afterall.mjs',
  '/afterAll.js',
  '/afterall.js',
  '/afterAll.ts',
  '/afterall.ts',
]

const scanDir = async (dir: string): Promise<void> => {
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

const extractExport = async (filePath: string): Promise<Record<string, unknown> | null> => {
  try {
    const mod = await import(filePath)
    return mod
  } catch {
    return null
  }
}

// Collect all beforeAll and afterAll hooks with their filenames
const beforeAllHooks: Array<{ file: string; fn: () => Promise<void | CleanupFunction> }> = []
const afterAllHooks: Array<{ file: string; fn: () => Promise<void | CleanupFunction> }> = []
const beforeAllCleanup: (() => void | Promise<void>)[] = []

const processHookFiles = async () => {
  const filesToProcess = [...discoveredFiles]
  for (const filePath of filesToProcess) {
    const fileName = path.basename(filePath)

    // Check if this is a beforeAll variant (case-sensitive matching)
    if (
      fileName === 'beforeAll.js' ||
      fileName === 'beforeall.js' ||
      fileName === 'beforeAll.ts' ||
      fileName === 'beforeall.ts' ||
      fileName === 'beforeAll.mjs' ||
      fileName === 'beforeall.mjs'
    ) {
      const mod = await extractExport(filePath)
      if (mod && is.function(mod.default)) {
        beforeAllHooks.push({
          file: fileName,
          fn: mod.default as () => Promise<void | CleanupFunction>,
        })
      }
      discoveredFiles.splice(discoveredFiles.indexOf(filePath), 1)
    }
    // Check if this is an afterAll variant (case-sensitive matching)
    else if (
      fileName === 'afterAll.js' ||
      fileName === 'afterAll.ts' ||
      fileName === 'afterAll.mjs' ||
      fileName === 'afterall.js' ||
      fileName === 'afterall.ts' ||
      fileName === 'afterall.mjs'
    ) {
      const mod = await extractExport(filePath)
      if (mod && is.function(mod.default)) {
        afterAllHooks.push({
          file: fileName,
          fn: mod.default as () => Promise<void | CleanupFunction>,
        })
      }
      discoveredFiles.splice(discoveredFiles.indexOf(filePath), 1)
    }
  }
}

await processHookFiles()

const getTestName = (testObj: WrappedTest, filePath: string, index: number): string => {
  if (testObj.info) return String(testObj.info)
  if (testObj.name) return String(testObj.name)
  if (testObj.fn && is.function(testObj.fn) && testObj.fn.name) return String(testObj.fn.name)

  const baseName = path.basename(filePath, path.extname(filePath))
  return `${baseName} ${index + 1}`
}

const runAssertion = async (result: unknown, expect: unknown): Promise<boolean> => {
  // If expect is a Promise, resolve it first and use the resolved value for comparison
  if (is.promise(expect)) {
    const resolved = await expect
    return runAssertion(result, resolved)
  }

  // If expect is exactly true, result must be exactly true
  if (expect === true) {
    return result === true
  }

  // If expect is exactly false, result must be exactly false
  if (expect === false) {
    return result === false
  }

  // If expect is function, run it against result
  if (is.fn(expect)) {
    const exp = await expect(result)
    // Match t.ts behavior exactly: when result !== true, check if exp === result OR exp === true
    if (result !== true) {
      return exp === result || exp === true
    }
    return exp === true
  }

  // For other cases (including undefined), use same logic as run/test.ts
  let pass = false

  if (is.undefined(expect)) {
    pass = result === undefined
  } else if (is.sameType(expect, result)) {
    if (is.arr(expect) || is.obj(expect)) {
      pass = is.deep.equal(result, expect)
    } else {
      pass = result === expect
    }
  }

  return pass
}

const convertTest = async (
  testObj: WrappedTest,
  filePath: string,
  index: number,
): Promise<TestItem> => {
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
      const { mount } = await import(path.join(__dirname, '..', 'lib', 'svelte', 'mount.ts'))
      let componentFile, componentProps

      if (is.string(testObj.component)) {
        componentFile = String(testObj.component)
        componentProps = testObj.props || {}
      } else if (is.array(testObj.component)) {
        componentFile = testObj.component[0] as string
        componentProps = (testObj.component[1] as ComponentProps) || {}
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

const convertSuite = async (tests: unknown, filePath: string): Promise<TestItem[]> => {
  if (!tests) return []

  if (is.function(tests)) {
    const result = await tests({})
    if (result) {
      return convertSuite(result, filePath)
    }
    return []
  }

  if (is.array(tests)) {
    const converted: TestItem[] = []
    for (let i = 0; i < tests.length; i++) {
      const testObj = tests[i]
      if (testObj && is.object(testObj)) {
        const convertedTest = await convertTest(testObj as WrappedTest, filePath, i)
        if (convertedTest) {
          converted.push(convertedTest)
        }
      }
    }
    return converted
  }

  if (is.objectNative(tests)) {
    const entries = Object.entries(tests)

    const converted: TestItem[] = []

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

const processFile = async (filePath: string): Promise<RunnerSuite[]> => {
  const mod = await extractExport(filePath)

  if (!mod) return []

  const fileName = path.basename(filePath)

  if (mod === undefined || mod === null) return []

  const suites: RunnerSuite[] = []

  if (mod.default) {
    const suiteName = fileName.replace(/\.(js|ts|mjs)$/, '')
    const tests = await convertSuite(mod.default, filePath)

    if (tests.length > 0) {
      suites.push({ name: suiteName, tests, hooks: mod.default as Record<string, unknown> })
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
        hooks: exportValue as TestHooks,
      })
    }
  }

  return suites
}

const run = async () => {
  const allSuites: RunnerSuite[] = []

  for (const filePath of discoveredFiles) {
    const suites = await processFile(filePath)
    allSuites.push(...suites)
  }

  // Run all beforeAll hooks in the defined order AFTER suites are collected
  // (matching t.ts/run.ts behavior - beforeAll runs once after all test files are loaded)
  for (const beforeAllEntry of BEFORE_ALL_FILES) {
    const hook = beforeAllHooks.find(h => h.file === path.basename(beforeAllEntry))
    if (hook) {
      const result = await hook.fn()
      if (is.function(result)) {
        beforeAllCleanup.push(result as CleanupFunction)
      }
    }
  }

  for (const suite of allSuites) {
    const hooks = suite.hooks as TestHooks

    describe(suite.name, () => {
      let beforeAllCleanup: CleanupFunction | null = null

      if (hooks.beforeAll && is.function(hooks.beforeAll)) {
        before(async () => {
          const result = await (hooks.beforeAll as SuiteHookWithArg)(allSuites)
          if (result && is.function(result)) {
            beforeAllCleanup = result as CleanupFunction
          }
          return undefined
        })
      }

      if (hooks.beforeAll && is.function(hooks.beforeAll)) {
        after(async () => {
          if (beforeAllCleanup && is.function(beforeAllCleanup)) {
            await beforeAllCleanup()
          }
        })
      }

      if (hooks.afterAll && is.function(hooks.afterAll)) {
        after(async () => {
          await (hooks.afterAll as SuiteHookWithArg)(allSuites)
        })
      }

      for (const testObj of suite.tests) {
        it(testObj.name, async () => {
          let testAfter

          if (testObj.before && is.function(testObj.before)) {
            const result = await testObj.before(testObj)
            if (is.function(result)) {
              testAfter = result as CleanupFunction
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
    // 1. Run all afterAll hooks in order
    for (const afterAllEntry of AFTER_ALL_FILES) {
      const hook = afterAllHooks.find(h => h.file === path.basename(afterAllEntry))
      if (hook) {
        await hook.fn()
      }
    }

    // 2. Run all beforeAll cleanup handlers (in order they were collected)
    for (const cleanup of beforeAllCleanup) {
      await cleanup()
    }

    // 3. Clean up temp directory
    const tmpDir = path.join(cwd, 'test', '.tmp')
    const exists = await fs.exists(tmpDir)
    if (exists) {
      await fs.rmrf(tmpDir)
    }
  })
}

run()

export default run
