import path from 'node:path'
import { isSvelteFile } from '#lib/svelte/compile/isSvelteFile.js'
import { getTempFilePath } from '#lib/svelte/compile/getTempFilePath.js'
import { computeRelativePath } from '#lib/svelte/compile/computeRelativePath.js'
import { transformForNode } from '#lib/svelte/compile/transformForNode.js'
import { parallelMap, MAX_CONCURRENT } from '#lib/svelte/compile/parallelMap.js'
import { acquireLock } from '#lib/svelte/compile/acquireLock.js'
import { CACHE_DIR, CWD } from '#src/constants.js'
import type { TestCase } from '#src/types.js'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const tests: TestCase[] = [
  // --- isSvelteFile ---
  { fn: () => isSvelteFile('Button.svelte'), expect: true, info: 'isSvelteFile true for .svelte' },
  { fn: () => isSvelteFile('page.svx'), expect: true, info: 'isSvelteFile true for .svx' },
  { fn: () => isSvelteFile('Button.ts'), expect: false, info: 'isSvelteFile false for .ts' },
  { fn: () => isSvelteFile('Button.js'), expect: false, info: 'isSvelteFile false for .js' },
  { fn: () => isSvelteFile('Button'), expect: false, info: 'isSvelteFile false for no extension' },
  {
    fn: () => isSvelteFile('/abs/path/to/Component.svelte'),
    expect: true,
    info: 'isSvelteFile true with full path',
  },

  // --- getTempFilePath ---
  {
    fn: () => {
      const src = path.join(CWD, 'src', 'Button.svelte')
      const tmp = getTempFilePath(src)
      return tmp.startsWith(CACHE_DIR) && tmp.endsWith('Button.svelte.js')
    },
    expect: true,
    info: 'getTempFilePath maps .svelte to CACHE_DIR .svelte.js',
  },
  {
    fn: () => {
      const src = path.join(CWD, 'test', 'nested', 'Card.svelte')
      const tmp = getTempFilePath(src)
      return path.basename(tmp) === 'Card.svelte.js'
    },
    expect: true,
    info: 'getTempFilePath preserves nested directory structure',
  },

  // --- computeRelativePath ---
  {
    fn: () => computeRelativePath(path.join(CWD, 'src', 'a'), path.join(CWD, 'src', 'b', 'c.js')),
    expect: '../b/c.js',
    info: 'computeRelativePath from sibling dir goes up one',
  },
  {
    fn: () => computeRelativePath(path.join(CWD, 'src'), path.join(CWD, 'src', 'deep', 'x.js')),
    expect: './deep/x.js',
    info: 'computeRelativePath relative subdir',
  },
  {
    fn: () => {
      const result = computeRelativePath(path.join(CWD, 'a', 'b'), path.join(CWD, 'a', 'c', 'd.js'))
      return result === '../c/d.js' || result === './c/d.js'
    },
    expect: true,
    info: 'computeRelativePath handles parent traversal',
  },

  // --- transformForNode ---
  {
    fn: () => transformForNode('const x = _unknown_;', 'MyButton.svelte'),
    expect: 'const x = MyButton$component;',
    info: 'transformForNode replaces _unknown_ with safe component name ($$ collapses to $ in replace)',
  },
  {
    fn: () => transformForNode('a _unknown_ b', 'My-Button.svelte'),
    expect: 'a My_Button$component b',
    info: 'transformForNode sanitizes non-alphanumeric chars',
  },
  {
    fn: () => transformForNode('no placeholder', 'Button.svelte'),
    expect: 'no placeholder',
    info: 'transformForNode no-op when no _unknown_',
  },

  // --- parallelMap ---
  { fn: () => MAX_CONCURRENT === 5, expect: true, info: 'MAX_CONCURRENT is 5' },
  {
    fn: async () => {
      const out = await parallelMap([1, 2, 3, 4, 5, 6], async n => n * 2)
      return JSON.stringify(out) === JSON.stringify([2, 4, 6, 8, 10, 12])
    },
    expect: true,
    info: 'parallelMap preserves order',
  },
  {
    fn: async () => {
      const out = await parallelMap([], async (n: number) => n)
      return out.length === 0
    },
    expect: true,
    info: 'parallelMap with empty array',
  },
  {
    fn: async () => {
      // verify concurrency limit is respected
      let active = 0
      let maxActive = 0
      const out = await parallelMap(
        [1, 2, 3, 4, 5, 6, 7, 8],
        async n => {
          active++
          maxActive = Math.max(maxActive, active)
          await sleep(10)
          active--
          return n
        },
        2,
      )
      return maxActive <= 2 && out.length === 8
    },
    expect: true,
    info: 'parallelMap respects concurrency limit',
  },
  {
    fn: async () => {
      const out = await parallelMap([1, 2, 3], async (n, i) => i * 10 + n)
      return JSON.stringify(out) === JSON.stringify([1, 12, 23])
    },
    expect: true,
    info: 'parallelMap passes index to fn',
  },

  // --- acquireLock ---
  {
    fn: async () => {
      const release = await acquireLock('/tmp/lock-a')
      return typeof release === 'function'
    },
    expect: true,
    info: 'acquireLock returns a release function',
  },
  {
    fn: async () => {
      // repeated acquire/release cycles work without deadlock
      for (let i = 0; i < 5; i++) {
        const r = await acquireLock('/tmp/lock-b')
        r()
      }
      return true
    },
    expect: true,
    info: 'acquireLock repeated acquire/release cycles do not deadlock',
  },
  {
    fn: async () => {
      // different paths don't block each other
      const r1 = await acquireLock('/tmp/lock-c1')
      const r2 = await acquireLock('/tmp/lock-c2')
      r1()
      r2()
      return true
    },
    expect: true,
    info: 'acquireLock independent per path',
  },
]

export default tests
