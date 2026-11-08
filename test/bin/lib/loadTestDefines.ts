// loadTestDefines requires file system operations with specific file paths
// and relies on process.cwd(). These tests require complex setup.
// For now, we test the function exists and returns expected types.

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import is from '@magic/types'
import { loadTestDefines, parseDefineValue } from '#src/bin/lib/loadTestDefines.js'
import type { TestCase } from '#src/types.js'

const withDefDir = async (files: Record<string, string>, fn: (dir: string) => Promise<unknown>) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'magic-defines-'))
  await writeFile(path.join(dir, 'package.json'), '{ "type": "module" }')
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel)
    await mkdir(path.dirname(full), { recursive: true })
    await writeFile(full, content)
  }
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

export default [
  // Function exists and is async
  {
    fn: async () => loadTestDefines,
    expect: is.function,
    info: 'loadTestDefines is a function',
  },
  // Returns promise
  {
    // can not return and expect: is.promise, @magic/test will await the promise if we do
    fn: () => is.promise(loadTestDefines('/nonexistent/path')),
    expect: true,
    info: 'loadTestDefines returns a Promise',
  },
  // Returns empty object when no files exist
  {
    fn: async () => loadTestDefines('/nonexistent/path/that/does/not/exist'),
    expect: is.objectNative,
    info: 'returns empty object for nonexistent directory',
  },
  // Returns object when test directory doesn't exist
  {
    fn: async () => await loadTestDefines('/tmp'),
    expect: is.object,
    info: 'returns object for directory without test defines',
  },
  // parseDefineValue
  {
    fn: () => parseDefineValue('"my url"'),
    expect: 'my url',
    info: 'parseDefineValue unwraps pre-stringified JSON strings',
  },
  {
    fn: () => parseDefineValue('42'),
    expect: 42,
    info: 'parseDefineValue parses JSON numbers',
  },
  {
    fn: () => parseDefineValue('http://localhost:9000'),
    expect: 'http://localhost:9000',
    info: 'parseDefineValue keeps raw strings that are not JSON',
  },
  // loadTestDefines with fixture files
  {
    fn: () => withDefDir({}, dir => loadTestDefines(dir)),
    expect: {},
    info: 'loadTestDefines returns {} when no defines file exists',
  },
  {
    fn: () =>
      withDefDir({ 'test/defines.mjs': `export default { API_URL: 'http://api' }` }, dir =>
        loadTestDefines(dir),
      ),
    expect: { API_URL: 'http://api' },
    info: 'loadTestDefines reads test/defines.mjs default export',
  },
  {
    fn: () =>
      withDefDir({ 'test/defines.ts': `export const define = { T: 1 }` }, dir =>
        loadTestDefines(dir),
      ),
    expect: { T: 1 },
    info: 'loadTestDefines reads test/defines.ts named define export',
  },
  {
    fn: () =>
      withDefDir(
        {
          'test/.defines.mjs': `export default { FIRST: 'yes' }`,
          'test/defines.mjs': `export default { SECOND: 'no' }`,
        },
        dir => loadTestDefines(dir),
      ),
    expect: { FIRST: 'yes' },
    info: 'loadTestDefines prefers .defines.mjs over defines.mjs',
  },
  {
    fn: () =>
      withDefDir({ 'test/defines.mjs': `export const notDefault = {}` }, dir =>
        loadTestDefines(dir),
      ),
    expect: {},
    info: 'loadTestDefines returns {} when the module has no default or define export',
  },
  {
    fn: async () =>
      withDefDir({ 'test/defines.mjs': `export default {` }, async dir => {
        const originalWarn = console.warn
        let warned = false
        console.warn = (() => {
          warned = true
        }) as typeof console.warn
        try {
          const result = await loadTestDefines(dir)
          return { result, warned }
        } finally {
          console.warn = originalWarn
        }
      }),
    expect: (v: { result: unknown; warned: boolean }) =>
      is.objectNative(v.result) && Object.keys(v.result as object).length === 0 && v.warned,
    info: 'loadTestDefines warns and returns {} when the defines file fails to import',
  },
] satisfies TestCase[]
