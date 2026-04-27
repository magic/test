import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { compileBarrel } from '../../../../src/lib/svelte/compile/compileBarrel.js'
import { barrelCache, processingBarrels } from '../../../../src/lib/svelte/compile/cache.js'

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
      return result.wrapperAbsPath.includes('.barrel.js')
    },
    expect: true,
    info: 'compileBarrel returns wrapperAbsPath with .barrel.js extension',
  },
  {
    fn: async () => {
      const result = await compileBarrel(barrelFixturePath)
      return result.js.code.includes('TestComponent') && result.js.code.includes('TitleComponent')
    },
    expect: true,
    info: 'compileBarrel generates wrapper code with named exports',
  },
  {
    fn: async () => {
      try {
        await compileBarrel(barrelFixturePath, [barrelFixturePath])
        return false
      } catch (e) {
        const error = e as Error
        return error.message.includes('Circular dependency detected')
      }
    },
    expect: true,
    info: 'compileBarrel throws error on circular dependency',
  },
  {
    fn: async () => {
      try {
        await compileBarrel(emptyBarrelPath)
        return false
      } catch (e) {
        const error = e as Error
        return error.message.includes('No Svelte exports found')
      }
    },
    expect: true,
    info: 'compileBarrel throws error when no Svelte exports found',
  },
  {
    fn: async () => {
      const result = await compileBarrel(barrelWithDefaultPath)
      return result.js.code.includes('export { default }')
    },
    expect: true,
    info: 'compileBarrel handles default exports correctly',
  },
  {
    fn: async () => {
      const result = await compileBarrel(barrelWithTypeExportsPath)
      return !result.js.code.includes('type ') && result.js.code.length > 0
    },
    expect: true,
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
]
