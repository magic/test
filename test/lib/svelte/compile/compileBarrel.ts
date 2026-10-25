import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { compileBarrel } from '#src/lib/svelte/compile/compileBarrel.js'
import { barrelCache } from '#src/lib/caches/cache.js'
import { getTempFilePath } from '#src/lib/svelte/compile/getTempFilePath.js'
import { getCwd } from '#src/constants.js'
import type { TestCase } from '#src/types.js'
import { has } from '#src/lib/has.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureBase = path.join(
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
)

const barrelFixturePath = path.join(fixtureBase, 'Index.svelte.js')
const barrelWithDefaultPath = path.join(fixtureBase, 'DefaultBarrel.svelte.js')
const barrelWithTypeExportsPath = path.join(fixtureBase, 'TypeExports.svelte.js')
const emptyBarrelPath = path.join(fixtureBase, 'EmptyBarrel.svelte.js')

export default [
  {
    fn: async () => {
      const result = await compileBarrel(barrelFixturePath)
      // Wrapper lives at the standard persistent-cache temp path (same naming
      // as getCachePath) so the recordCompile/getCachedCompile roundtrip works
      return result.wrapperAbsPath === path.join(getCwd(), getTempFilePath(barrelFixturePath))
    },
    expect: true,
    info: 'compileBarrel writes the wrapper to the standard persistent-cache temp path',
  },
  {
    fn: async () => {
      barrelCache.delete(barrelFixturePath)
      const result = await compileBarrel(barrelFixturePath)
      return result.js.includes('TestComponent')
    },
    expect: true,
    info: 'compileBarrel generates wrapper code with TestComponent',
  },
  {
    fn: async () => {
      barrelCache.delete(barrelFixturePath)
      const result = await compileBarrel(barrelFixturePath)
      return result.js
    },
    expect: has.includes('TitleComponent'),
    info: 'compileBarrel generates wrapper code with TitleComponent',
  },
  {
    fn: async () => {
      barrelCache.delete(barrelFixturePath)
      try {
        await compileBarrel(barrelFixturePath, [barrelFixturePath])
        return false
      } catch (e) {
        const error = e as Error
        return error.message
      }
    },
    expect: has.includes('Circular dependency detected'),
    info: 'compileBarrel throws error on circular dependency',
  },
  {
    fn: async () => {
      try {
        await compileBarrel(emptyBarrelPath)
        return false
      } catch (e) {
        const error = e as Error
        return error.message
      }
    },
    expect: has.includes('No Svelte exports found'),
    info: 'compileBarrel throws error when no Svelte exports found',
  },
  {
    fn: async () => {
      const result = await compileBarrel(barrelWithDefaultPath)
      return result.js
    },
    expect: has.includes('export { default }'),
    info: 'compileBarrel handles default exports correctly',
  },
  {
    fn: async () => {
      const result = await compileBarrel(barrelWithTypeExportsPath)
      return result.js.includes('type ')
    },
    expect: false,
    info: 'compileBarrel filters out type-only exports',
  },
  {
    fn: async () => {
      const cacheKey = barrelFixturePath
      barrelCache.delete(cacheKey)
      const before = barrelCache.has(cacheKey)
      await compileBarrel(barrelFixturePath)
      const after = barrelCache.has(cacheKey)
      return before === false && after === true
    },
    expect: true,
    info: 'compileBarrel caches result in barrelCache',
  },
  {
    fn: async () => {
      barrelCache.delete(barrelFixturePath)
      const result1 = await compileBarrel(barrelFixturePath)
      const result2 = await compileBarrel(barrelFixturePath)
      return result1.wrapperAbsPath === result2.wrapperAbsPath
    },
    expect: true,
    info: 'compileBarrel returns cached result on second call',
  },
] satisfies TestCase[]
