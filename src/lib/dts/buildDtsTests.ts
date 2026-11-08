import path from 'node:path'

import type { Test } from '../../types.js'

import { collectDtsFiles } from './collectDtsFiles.js'
import { checkDtsFile, summarizeErrors } from './typeCheckDts.js'
import type { DtsCheckResult } from './typeCheckDts.js'

/**
 * Suite key prefix for the virtual .d.ts test suites.
 *
 * The key is a path-like string with a leading slash (e.g. `/__dts__/src/app.d.ts`)
 * so it matches the convention of file-based suite keys (e.g. `/spec.ts`).
 * Every test in a d.ts suite shares the suite key, exactly like the tests of a
 * normal file suite share the file path - this is what makes the runner's final
 * failure summary (`* fail:` block, keyed on `test.key === suite.name`) print
 * the per-test detail for these virtual suites.
 */
export const DTS_SUITE_PREFIX = '/__dts__/'

const rel = (root: string, file: string): string =>
  path.relative(root, file).split(path.sep).join('/')

type FileCheck =
  | { file: string; ok: true; result: DtsCheckResult }
  | { file: string; ok: false; error: unknown }

/**
 * Run the type check for every collected .d.ts file up front (in parallel, one
 * in-memory TypeScript program per file). Doing this at collection time -
 * rather than lazily inside the test functions - means:
 *
 * - the specific diagnostics are known before the run starts, so they can be
 *   baked into each test's `info`. The final summary is the only place failure
 *   detail is reliably printed (mid-run `console.error` is swapped to a no-op
 *   by other tests, which would otherwise swallow the runtime error log);
 * - the test functions themselves become trivial (read a precomputed verdict
 *   and throw/return), so they never touch the compiler at execution time and
 *   cannot hit a per-test timeout on the multi-second program build.
 */
const checkAll = async (files: string[], root: string): Promise<FileCheck[]> => {
  return Promise.all(
    files.map(async (file): Promise<FileCheck> => {
      try {
        return { file, ok: true, result: await checkDtsFile(file, root) }
      } catch (error) {
        return { file, ok: false, error }
      }
    }),
  )
}

const checkErrorMessage = (error: unknown, relFile: string): string =>
  `d.ts check could not run for ${relFile}: ${
    error instanceof Error ? error.message : String(error)
  }`

/**
 * Build the full set of virtual .d.ts test suites for a project.
 *
 * Each .d.ts file becomes one virtual suite:
 * - a `file compiles` test (the declaration file is valid TypeScript)
 * - one test per declared symbol (interfaces, types, classes, enums,
 *   functions, values, ambient modules, globals)
 *
 * A failing test throws a message that names the declaration and the exact
 * TypeScript diagnostic(s), and carries the same message in its `info` so the
 * failure is still visible in the final summary.
 *
 * IMPORTANT: the test functions must stay free of source-level literals that
 * the suite heuristics pattern-match on (`globalThis`, `window`, `self`,
 * `process.env`, `fs.xxx('...')`) - otherwise the runner would route these
 * tests to workers, which re-import test files from disk and cannot see
 * virtual suites. All compiler work happens in `checkAll` (imported, and run
 * at collection time), never inside the test functions.
 */
export const buildDtsTestSuites = async (root: string): Promise<Record<string, Test[]>> => {
  const files = await collectDtsFiles(root)
  const checks = await checkAll(files, root)
  const suites: Record<string, Test[]> = {}

  for (const check of checks) {
    const relFile = rel(root, check.file)
    const suiteKey = `${DTS_SUITE_PREFIX}${relFile}`
    const tests: Test[] = []

    if (check.ok) {
      const r = check.result

      const fileError = r.filePass
        ? ''
        : `declaration file has type errors (${relFile}): ${summarizeErrors(r.fileErrors)}`

      tests.push({
        name: 'file compiles',
        key: suiteKey,
        info: r.filePass ? `${relFile} is valid TypeScript` : fileError,
        fn: async () => {
          if (!r.filePass) {
            throw new Error(fileError)
          }
          return true
        },
        expect: true,
      })

      for (const sr of r.symbols) {
        const sym = sr.symbol
        const error = sr.pass
          ? ''
          : `type check failed for ${sym.displayName}: ${summarizeErrors(sr.errors)}`

        tests.push({
          name: sym.displayName,
          key: suiteKey,
          info: sr.pass ? `${sym.info} (${relFile})` : `${error} (${relFile})`,
          fn: async () => {
            if (!sr.pass) {
              throw new Error(error)
            }
            return true
          },
          expect: true,
        })
      }
    } else {
      const message = checkErrorMessage(check.error, relFile)
      tests.push({
        name: 'file compiles',
        key: suiteKey,
        info: message,
        fn: async () => {
          throw new Error(message)
        },
        expect: true,
      })
    }

    suites[suiteKey] = tests
  }

  return suites
}
