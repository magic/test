import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getSvelteExports } from '../../../../src/lib/svelte/compile/getSvelteExports.js'

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

export default [
  {
    fn: async () => {
      const barrelPath = path.join(fixtureBase, 'Index.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      return exports.length === 2
    },
    expect: true,
    info: 'getSvelteExports returns correct number of exports',
  },
  {
    fn: async () => {
      const barrelPath = path.join(fixtureBase, 'Index.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      const names = exports.map(e => e.name)
      return names.includes('TestComponent') && names.includes('TitleComponent')
    },
    expect: true,
    info: 'getSvelteExports returns correct export names including alias',
  },
  {
    fn: async () => {
      const barrelPath = path.join(fixtureBase, 'EmptyBarrel.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      return exports.length === 0
    },
    expect: true,
    info: 'getSvelteExports returns empty array for empty barrel',
  },
  {
    fn: async () => {
      const barrelPath = path.join(fixtureBase, 'Index.svelte.js')
      const exports1 = await getSvelteExports(barrelPath)
      const exports2 = await getSvelteExports(barrelPath)
      return exports1.length === exports2.length && exports1.length === 2
    },
    expect: true,
    info: 'getSvelteExports returns consistent results on multiple calls',
  },
  {
    fn: async () => {
      const barrelPath = path.join(fixtureBase, 'Index.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      return exports.every(e => e.path.endsWith('.svelte'))
    },
    expect: true,
    info: 'getSvelteExports returns valid Svelte paths',
  },
]
