import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { readRecursive } from '#src/bin/lib/readRecursive.js'
import type { TestCase } from '#src/types.js'

const GOOD = `export default [
  { fn: () => 1, expect: 1, info: 'good test' },
]`

// unterminated string → the file always fails to import
const BAD = `export default [
  { fn: () => 1, expect: 1, info: 'broken syntax`

// readRecursiveImpl joins its argument under <cwd>/test, so hand it the path
// relative to that. Returns [rel, absDir].
const withTestDir = async (
  files: Record<string, string>,
  fn: (rel: string, dir: string) => Promise<unknown>,
) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'magic-readrec-'))
  for (const [name, content] of Object.entries(files)) {
    await writeFile(path.join(dir, name), content)
  }
  try {
    const rel = path.relative(path.join(process.cwd(), 'test'), dir)
    return await fn(rel, dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

/**
 * `before` hook that silences readRecursive's "N test file(s) failed to load"
 * console output so these intentional failures don't pollute the suite log.
 *
 * It must live in a `before` hook (not wrapped around the fn) for two reasons:
 * 1. The messages are emitted via `console.error`, and the swap has to be in
 *    effect for the whole of `fn`.
 * 2. A `before` hook marks the test for isolation, so it runs in a worker
 *    thread where the console (and process.env) are local. Swapping a global
 *    from a main-thread test that runs in parallel with others is racy - that
 *    race is what let the messages leak before. We do NOT assert on the
 *    captured text; the error-reporting lines still execute (and are covered)
 *    whenever a file fails to import.
 */
const silenceConsoleError = (): (() => void) => {
  const original = console.error
  console.error = ((..._args: unknown[]) => undefined) as typeof console.error
  return () => {
    console.error = original
  }
}

export default [
  {
    before: silenceConsoleError,
    fn: () =>
      withTestDir({ 'good.mjs': GOOD }, (rel, _dir) =>
        readRecursive(rel).then(suites => {
          const keys = Object.keys(suites)
          return {
            goodLoaded: keys.some(k => k.includes('good.mjs')),
            count: keys.length,
          }
        }),
      ),
    expect: (v: { goodLoaded: boolean; count: number }) => v.goodLoaded && v.count === 1,
    info: 'readRecursive loads a valid test file',
  },
  {
    before: silenceConsoleError,
    fn: () =>
      withTestDir({ 'good.mjs': GOOD, 'bad.mjs': BAD }, (rel, _dir) =>
        readRecursive(rel).then(suites => {
          const keys = Object.keys(suites)
          return {
            goodLoaded: keys.some(k => k.includes('good.mjs')),
            badExcluded: !keys.some(k => k.includes('bad.mjs')),
            count: keys.length,
          }
        }),
      ),
    expect: (v: { goodLoaded: boolean; badExcluded: boolean; count: number }) =>
      v.goodLoaded && v.badExcluded && v.count === 1,
    info: 'readRecursive keeps good files and drops files that fail to import (error path runs)',
  },
  {
    before: silenceConsoleError,
    fn: () =>
      withTestDir({ 'bad.mjs': BAD }, (rel, _dir) => {
        const saved = process.env.MAGIC_TEST_VERBOSE_ERRORS
        process.env.MAGIC_TEST_VERBOSE_ERRORS = '1'
        return readRecursive(rel)
          .then(suites => ({ empty: Object.keys(suites).length === 0 }))
          .finally(() => {
            if (saved === undefined) {
              delete process.env.MAGIC_TEST_VERBOSE_ERRORS
            } else {
              process.env.MAGIC_TEST_VERBOSE_ERRORS = saved
            }
          })
      }),
    expect: (v: { empty: boolean }) => v.empty,
    info: 'readRecursive yields no suites when only a broken file is present (verbose error path runs)',
  },
] satisfies TestCase[]
