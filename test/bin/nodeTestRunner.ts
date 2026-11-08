import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import {
  convertSuite,
  convertTest,
  discoveredFiles,
  extractExport,
  getTestName,
  processFile,
  scanDir,
} from '#src/bin/node-test-runner.js'
import is from '@magic/types'
import type { TestCase, TestBeforeHook, TestAfterHook } from '#src/types.js'

const makeTmpDir = async (prefix: string) => mkdtemp(path.join(os.tmpdir(), `magic-ntr-${prefix}-`))

const writeFixture = async (dir: string, name: string, content: string) => {
  await writeFile(path.join(dir, name), content)
}

// convertTest returns a TestItem whose fn() resolves on pass and rejects on
// fail. These helpers run it and normalize the outcome.
const runConverted = async (testObj: Record<string, unknown>) => {
  const converted = await convertTest(testObj as never, 'spec.ts', 0)
  try {
    await converted.fn()
    return { pass: true, error: undefined }
  } catch (e) {
    return { pass: false, error: (e as Error).message }
  }
}

export default [
  // getTestName
  {
    fn: () => getTestName({ info: 'my info' } as never, '/p/file.ts', 0),
    expect: 'my info',
    info: 'getTestName prefers info',
  },
  {
    fn: () => getTestName({ name: 'my name' } as never, '/p/file.ts', 0),
    expect: 'my name',
    info: 'getTestName falls back to name when no info',
  },
  {
    fn: () => {
      const namedFn = () => 1
      return getTestName({ fn: namedFn } as never, '/p/file.ts', 0)
    },
    expect: 'namedFn',
    info: 'getTestName falls back to function name',
  },
  {
    fn: () => getTestName({} as never, '/p/foo.ts', 3),
    expect: 'foo 4',
    info: 'getTestName falls back to file basename + index',
  },

  // convertTest
  {
    fn: async () => runConverted({ fn: () => 42, expect: 42 }),
    expect: (v: { pass: boolean }) => v.pass === true,
    info: 'convertTest passes when fn result matches expect',
  },
  {
    fn: async () => runConverted({ fn: () => 1, expect: 2 }),
    expect: (v: { pass: boolean; error?: string }) =>
      v.pass === false && v.error?.includes('Expected:') && v.error?.includes('Got:'),
    info: 'convertTest rejects with Expected/Got message on mismatch',
  },
  {
    fn: async () => runConverted({ fn: Promise.resolve('x'), expect: 'x' }),
    expect: (v: { pass: boolean }) => v.pass === true,
    info: 'convertTest awaits promise fn',
  },
  {
    fn: async () => runConverted({ fn: 'literal', expect: 'literal' }),
    expect: (v: { pass: boolean }) => v.pass === true,
    info: 'convertTest handles non-function fn as literal value',
  },
  {
    fn: async () => runConverted({ is: 7 }),
    expect: (v: { pass: boolean }) => v.pass === false,
    info: 'convertTest with only is and no expect compares undefined to true (fails)',
  },
  {
    fn: async () => {
      const before = (() => undefined) as TestBeforeHook
      const after = (() => undefined) as TestAfterHook
      const converted = await convertTest(
        { fn: () => 1, expect: 1, before, after } as never,
        's.ts',
        2,
      )
      return {
        name: converted.name,
        hasBefore: converted.before === before,
        hasAfter: converted.after === after,
      }
    },
    expect: { name: 'fn', hasBefore: true, hasAfter: true },
    info: 'convertTest passes through before/after hooks; arrow fn in fn slot is named fn',
  },

  // convertSuite
  {
    fn: () => convertSuite(null, 'x.ts'),
    expect: [],
    info: 'convertSuite returns [] for null',
  },
  {
    fn: () => convertSuite(undefined, 'x.ts'),
    expect: [],
    info: 'convertSuite returns [] for undefined',
  },
  {
    fn: () => convertSuite(async () => [{ fn: () => 1, expect: 1 }], 'x.ts'),
    expect: is.len.eq(1),
    info: 'convertSuite converts array returned by function',
  },
  {
    fn: () => convertSuite([42, 'str', { fn: () => 1, expect: 1 }], 'x.ts'),
    expect: is.len.eq(1),
    info: 'convertSuite skips non-object array entries',
  },
  {
    fn: () =>
      convertSuite(
        {
          beforeAll: () => undefined,
          a: [{ fn: () => 1, expect: 1 }],
          nested: { b: [{ fn: () => 2, expect: 2 }] },
        },
        'x.ts',
      ),
    expect: is.len.eq(2),
    info: 'convertSuite flattens object suites and skips beforeAll',
  },
  {
    fn: () => convertSuite({ lazy: async () => [{ fn: () => 1, expect: 1 }] }, 'x.ts'),
    expect: is.len.eq(1),
    info: 'convertSuite awaits lazy function suite values',
  },

  // extractExport
  {
    fn: async () => {
      const dir = await makeTmpDir('extract')
      try {
        await writeFixture(dir, 'mod.mjs', 'export default [1, 2, 3]')
        return extractExport(path.join(dir, 'mod.mjs'))
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
    },
    expect: (v: Record<string, unknown>) => Array.isArray(v?.default) && v.default.length === 3,
    info: 'extractExport imports an existing module',
  },
  {
    fn: () => extractExport('/nonexistent/magic-ntr-never-exists.mjs'),
    expect: null,
    info: 'extractExport returns null for missing files',
  },

  // processFile
  {
    fn: async () => {
      const dir = await makeTmpDir('processfile')
      try {
        await writeFixture(
          dir,
          'fixtureDefault.mjs',
          `export default [{ fn: () => 1, expect: 1, info: 'one' }]`,
        )
        const suites = await processFile(path.join(dir, 'fixtureDefault.mjs'))
        return {
          suiteCount: suites.length,
          suiteName: suites[0]?.name,
          testCount: suites[0]?.tests.length,
          testName: suites[0]?.tests[0]?.name,
        }
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
    },
    expect: { suiteCount: 1, suiteName: 'fixtureDefault', testCount: 1, testName: 'one' },
    info: 'processFile converts default export into a named suite',
  },
  {
    fn: async () => {
      const dir = await makeTmpDir('processfile2')
      try {
        await writeFixture(
          dir,
          'fixtureNamed.mjs',
          [
            'export const named = [{ fn: () => "a", expect: "a", info: "named one" }]',
            "export const notTests = 'plain string'",
            'export default [{ fn: () => 2, expect: 2 }]',
          ].join('\n'),
        )
        const suites = await processFile(path.join(dir, 'fixtureNamed.mjs'))
        const names = suites.map(s => s.name).sort()
        return names
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
    },
    expect: ['fixtureNamed', 'fixtureNamed_named'],
    info: 'processFile builds suites for default and named exports, skips non-test exports',
  },
  {
    fn: () => processFile('/nonexistent/magic-ntr-never-exists.mjs'),
    expect: [],
    info: 'processFile returns [] for missing files',
  },

  // scanDir
  {
    fn: async () => {
      const dir = await makeTmpDir('scandir')
      try {
        await mkdir(path.join(dir, 'sub'), { recursive: true })
        await mkdir(path.join(dir, 'node_modules'), { recursive: true })
        await mkdir(path.join(dir, '.hidden'), { recursive: true })
        await writeFixture(dir, 'a.ts', '')
        await writeFixture(dir, 'b.js', '')
        await writeFixture(dir, 'c.mjs', '')
        await writeFixture(dir, 'd.txt', '')
        await writeFixture(path.join(dir, 'sub'), 'nested.ts', '')
        await writeFixture(path.join(dir, 'node_modules'), 'skip.js', '')
        await writeFixture(path.join(dir, '.hidden'), 'skip.ts', '')
        const before = discoveredFiles.length
        await scanDir(dir)
        return discoveredFiles.length - before
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
    },
    expect: 4,
    info: 'scanDir collects .ts/.js/.mjs recursively, skipping excluded and dot dirs',
  },
  {
    fn: async () => {
      const before = discoveredFiles.length
      await scanDir('/nonexistent/magic-ntr-never-exists')
      return discoveredFiles.length - before
    },
    expect: 0,
    info: 'scanDir adds nothing for a missing directory',
  },
] satisfies TestCase[]
