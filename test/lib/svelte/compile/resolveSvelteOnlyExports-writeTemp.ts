import path from 'node:path'
import { fileURLToPath } from 'node:url'
import is from '@magic/types'
import {
  writeTempFile,
  compileSvelteOnlyExport,
} from '#src/lib/svelte/compile/resolveSvelteOnlyExports.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturePath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'src',
  'lib',
  'svelte',
  'testFixtures',
  'barrelFixtures',
  'Index.svelte.js',
)

export default [
  {
    fn: () => is.fn(writeTempFile),
    expect: true,
    info: 'writeTempFile is exported and is a function',
  },
  {
    fn: async () => {
      const result = await writeTempFile('test.js', 'export default "hello"')
      return is.string(result) && result.length > 0
    },
    expect: true,
    info: 'writeTempFile returns a path string',
  },
  {
    fn: async () => {
      const code = 'export const x = 123'
      const path1 = await writeTempFile('dedup1.js', code)
      const path2 = await writeTempFile('dedup1.js', code)
      return path1 === path2
    },
    expect: true,
    info: 'writeTempFile deduplicates pending writes for same path',
  },
  {
    fn: async () => {
      const path1 = await writeTempFile('a.js', 'export const a = 1')
      const path2 = await writeTempFile('b.js', 'export const b = 2')
      return path1 !== path2
    },
    expect: true,
    info: 'writeTempFile returns different paths for different files',
  },
  {
    fn: () => is.fn(compileSvelteOnlyExport),
    expect: true,
    info: 'compileSvelteOnlyExport is exported and is a function',
  },
  {
    fn: async () => {
      const result = await compileSvelteOnlyExport(fixturePath, __dirname)
      return is.string(result) && result.length > 0
    },
    expect: true,
    info: 'compileSvelteOnlyExport returns a path for a JS barrel file',
  },
  // Test with a real Svelte component
  {
    fn: async () => {
      const sveltePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'src',
        'lib',
        'svelte',
        'testFixtures',
        'components',
        'Counter.svelte',
      )
      const result = await compileSvelteOnlyExport(sveltePath, __dirname)
      return is.string(result) && result.length > 0
    },
    expect: true,
    info: 'compileSvelteOnlyExport returns a path for a Svelte component',
  },
]
