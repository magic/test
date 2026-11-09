#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import(path.join(__dirname, 'lib/registerLoader.js'))

import { stats } from '../lib/index.js'

import cli from '@magic/cli'
import log from '@magic/log'

import { describe, before, after, it } from 'node:test'
import fs from '@magic/fs'
import is from '@magic/types'
import { CACHE_DIR } from '../constants.js'
import { maybeInjectMagic } from './lib/index.js'
import { evaluateTestResult } from '../run/lib/index.js'
import {
  isBeforeAllFile,
  isAfterAllFile,
  beforeAllFileNames,
  afterAllFileNames,
} from '../lib/hookFiles.js'

import type {
  WrappedTest,
  TestHooks,
  TestItem,
  CleanupFunction,
  SuiteHookWithArg,
  ComponentProps,
  TestContext,
} from '../types.js'

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

// Hook file names/order: canonical list lives in src/lib/hookFiles.ts

export const scanDir = async (dir: string): Promise<void> => {
  const exists = await fs.exists(dir)
  if (!exists) {
    return
  }

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

export const extractExport = async (filePath: string): Promise<Record<string, unknown> | null> => {
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
const beforeAllCleanup: CleanupFunction[] = []

const processHookFiles = async () => {
  const filesToProcess = [...discoveredFiles]
  for (const filePath of filesToProcess) {
    const fileName = path.basename(filePath)

    // Check if this is a beforeAll variant (case-sensitive matching)
    if (isBeforeAllFile(fileName)) {
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
    else if (isAfterAllFile(fileName)) {
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

export const getTestName = (testObj: WrappedTest, filePath: string, index: number): string => {
  if (testObj.info) {
    return String(testObj.info)
  }
  if (testObj.name) {
    return String(testObj.name)
  }
  if (testObj.fn && is.function(testObj.fn) && testObj.fn.name) {
    return String(testObj.fn.name)
  }

  const baseName = path.basename(filePath, path.extname(filePath))
  return `${baseName} ${index + 1}`
}

export const convertTest = async (
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
      const { mount } = await import(path.join(__dirname, '..', 'lib', 'svelte', 'mount.js'))
      let componentFile, componentProps

      if (is.string(testObj.component)) {
        componentFile = String(testObj.component)
        componentProps = testObj.props || {}
      } else if (is.array(testObj.component)) {
        componentFile = testObj.component[0] as string
        componentProps = (testObj.component[1] as ComponentProps) || {}
      }

      const { target, component, unmount, css } = await mount(componentFile, {
        props: componentProps,
      })
      try {
        if (is.function(fn)) {
          result = await fn({ target, component, unmount, css })
        }
      } finally {
        await unmount()
      }
    } else if (is.promise(fn)) {
      result = await fn
    } else if (is.function(fn)) {
      result = await fn({} as TestContext)
    } else {
      result = fn
    }

    const hasExpect = 'expect' in testObj
    const expect = hasExpect ? testObj.expect : true
    // Use the shared evaluator so semantics stay in sync with the main runner
    const evalResult = await evaluateTestResult(result, expect)

    if (!evalResult.pass) {
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

export const convertSuite = async (tests: unknown, filePath: string): Promise<TestItem[]> => {
  if (!tests) {
    return []
  }

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

export const processFile = async (filePath: string): Promise<RunnerSuite[]> => {
  const mod = await extractExport(filePath)

  if (!mod) {
    return []
  }

  const fileName = path.basename(filePath)

  if (is.undefined(mod) || is.null(mod)) {
    return []
  }

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

const registerTests = async () => {
  const allSuites: RunnerSuite[] = []

  for (const filePath of discoveredFiles) {
    const suites = await processFile(filePath)
    allSuites.push(...suites)
  }

  // Run all beforeAll hooks in the defined order AFTER suites are collected
  // (matching t.ts/run.ts behavior - beforeAll runs once after all test files are loaded)
  for (const fileName of beforeAllFileNames) {
    const hook = beforeAllHooks.find(h => h.file === fileName)
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

          if (testObj.before && (is.function(testObj.before) || is.promise(testObj.before))) {
            const result = is.function(testObj.before)
              ? await testObj.before(testObj)
              : await testObj.before
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
    for (const fileName of afterAllFileNames) {
      const hook = afterAllHooks.find(h => h.file === fileName)
      if (hook) {
        await hook.fn()
      }
    }

    // 2. Run all beforeAll cleanup handlers (in order they were collected)
    for (const cleanup of beforeAllCleanup) {
      await cleanup()
    }

    // 3. Clean up temp directory
    const tmpDir = path.join(CACHE_DIR, '.tmp')
    const exists = await fs.exists(tmpDir)
    if (exists) {
      await fs.rmrf(tmpDir)
    }
  })
}

// Re-exec node with NODE_V8_COVERAGE + source maps enabled, run this file as the
// test suite, then generate the coverage report once the child exits (V8 flushes
// coverage at process exit). The parent must be a plain `node` process — re-execing
// `node --test` from within a `node --test` process triggers Node's recursion guard.
// This is why `--coverage` works when invoked as `node node-test-runner.js --coverage`
// but Node consumes `--coverage` when combined with `node --test`.
const runCoverage = async (): Promise<void> => {
  const reportsDir = path.join(cwd, 'coverage')
  const tempDir = path.join(reportsDir, 'tmp')
  await fs.mkdirp(tempDir)

  const env = { ...process.env, NODE_V8_COVERAGE: tempDir } as Record<string, string>
  env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '')
    .split(' ')
    .filter(Boolean)
    .concat(['--enable-source-maps'])
    .join(' ')

  // Strip --coverage so the child does not re-exec again; keep --test so Node runs
  // this file as the test suite.
  const childArgv = [
    '--test',
    fileURLToPath(import.meta.url),
    ...process.argv.slice(2).filter(a => a !== '--coverage'),
  ]
  const child = cli.spawn(process.execPath, childArgv, { env })
  child.ref()

  let code = 0
  await new Promise<void>(resolve => {
    child.on('exit', c => {
      code = c ?? 1
      resolve()
    })
    child.on('error', err => {
      log.error(err as Error)
      code = 1
      resolve()
    })
  })

  try {
    await stats.coverage({
      tempDir,
      cwd,
      include: ['src'],
      exclude: ['test', '**/*.d.ts'],
      extensions: ['.js', '.mjs', '.ts', '.svelte'],
      all: true,
      excludeAfterRemap: true,
    })
  } catch (err) {
    log.error(err as Error)
  }

  process.exitCode = code
}

const main = async () => {
  try {
    await maybeInjectMagic()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  await scanDir(testDir)

  discoveredFiles.sort()

  await processHookFiles()

  await registerTests()
}

export { discoveredFiles }

export default main

// Only run the unit runner and install global handlers when executed
// directly (node dist/bin/unit.js). Importing this module (e.g. from tests)
// must not kick off the run or register process-level handlers.
// fs.realpathSync resolves symlinks so the check works when the bin is invoked
// via a symlinked node_modules (e.g. pnpm, npm workspaces).
const isMain =
  process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  try {
    // --coverage self-hosts the coverage pipeline: re-exec `node --test` with
    // NODE_V8_COVERAGE set, then generate the report after the child exits.
    // Node's --test mode consumes `--coverage` before it reaches process.argv,
    // so use `node node-test-runner.js --coverage` (plain node) for direct runs,
    // or `t --native` (= npm run test:native) which orchestrates coverage itself.
    if (process.argv.includes('--coverage')) {
      await runCoverage()
    } else {
      await main()
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
