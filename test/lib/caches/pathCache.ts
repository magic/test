import path from 'node:path'
import { statCached, existsCached, clearPathCache } from '#lib/caches/pathCache.js'
import { has } from '#lib/has.js'
import is from '@magic/types'
import type { TestCase } from '#src/types.js'

const CWD = process.cwd()
const existingFile = path.join(CWD, 'package.json')
const missingFile = path.join(CWD, 'does-not-exist-' + Date.now() + '.txt')

const tests: TestCase[] = [
  // statCached for existing file
  {
    fn: async () => {
      clearPathCache()
      const result = await statCached(existingFile)
      return result
    },
    expect: has.properties({ exists: true, mtime: is.num, size: is.num }),
    info: 'statCached returns exists=true with mtime and size for existing file',
  },
  // statCached for missing file
  {
    fn: async () => {
      clearPathCache()
      const result = await statCached(missingFile)
      return result.exists
    },
    expect: false,
    info: 'statCached returns exists=false for missing file',
  },
  // statCached caches the result (second call returns same object)
  {
    fn: async () => {
      clearPathCache()
      const first = await statCached(existingFile)
      const second = await statCached(existingFile)
      return { first, second }
    },
    expect: (v: { first: unknown; second: unknown }) => v.first === v.second,
    info: 'statCached returns cached object on second call',
  },
  // existsCached for existing file
  {
    fn: async () => {
      clearPathCache()
      return await existsCached(existingFile)
    },
    expect: true,
    info: 'existsCached returns true for existing file',
  },
  // existsCached for missing file
  {
    fn: async () => {
      clearPathCache()
      return await existsCached(missingFile)
    },
    expect: false,
    info: 'existsCached returns false for missing file',
  },
  // clearPathCache forces re-read
  {
    fn: async () => {
      clearPathCache()
      const first = await statCached(existingFile)
      clearPathCache()
      const second = await statCached(existingFile)
      // after clear, a new object is created
      return { same: first === second, exists: second.exists }
    },
    expect: has.properties({ same: false, exists: true }),
    info: 'clearPathCache invalidates cached entries',
  },
  // mixed existing/missing entries can be cached together
  {
    fn: async () => {
      clearPathCache()
      const a = await statCached(existingFile)
      const b = await statCached(missingFile)
      return { a: a.exists, b: b.exists }
    },
    expect: has.properties({ a: true, b: false }),
    info: 'mixed existing and missing paths cache independently',
  },
]

export default tests
