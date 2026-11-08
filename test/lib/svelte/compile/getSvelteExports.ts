import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { getSvelteExports } from '#lib/svelte/compile/getSvelteExports.js'
import { has } from '#lib/has.js'
import is from '@magic/types'

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
      return exports
    },
    expect: is.len.eq(2),
    info: 'getSvelteExports returns correct number of exports',
  },
  {
    fn: async () => {
      const barrelPath = path.join(fixtureBase, 'Index.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      const names = exports.map(e => e.name)
      return names
    },
    expect: has.includes('TestComponent', 'TitleComponent'),
    info: 'getSvelteExports returns correct export names including alias',
  },
  {
    fn: async () => {
      const barrelPath = path.join(fixtureBase, 'EmptyBarrel.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      return exports
    },
    expect: [],
    info: 'getSvelteExports returns empty array for empty barrel',
  },
  {
    fn: async () => {
      const barrelPath = path.join(fixtureBase, 'Index.svelte.js')
      const exports1 = await getSvelteExports(barrelPath)
      const exports2 = await getSvelteExports(barrelPath)
      return { len1: exports1.length, len2: exports2.length }
    },
    expect: (v: { len1: number; len2: number }) => v.len1 === v.len2 && v.len1 === 2,
    info: 'getSvelteExports returns consistent results on multiple calls',
  },
  {
    fn: async () => {
      const barrelPath = path.join(fixtureBase, 'Index.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      return exports.map(e => e.path)
    },
    expect: (v: string[]) => v.every(p => p.endsWith('.svelte')),
    info: 'getSvelteExports returns valid Svelte paths',
  },
  {
    fn: async () => {
      // "#-prefixed" re-export sources are package.json import-map entries
      // ("#test/*": "./test/*" in package.json), not relative paths -
      // resolving them against the barrel directory produced bogus paths
      // like "#lib/svelte/testFixtures/##lib/svelte/testFixtures/...".
      const barrelPath = path.join(fixtureBase, 'ImportMapBarrel.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      const firstExport = exports[0]
      return {
        count: exports.length,
        exists: firstExport ? fs.existsSync(firstExport.path) : false,
        first: firstExport,
      }
    },
    expect: has.properties({
      count: 1,
      exists: true,
      first: has.properties({
        name: 'TestComponent',
        path: path.join(fixtureBase, '..', 'components', 'TestComponent.svelte'),
      }),
    }),
    info: 'getSvelteExports resolves #-prefixed import-map sources against package.json imports',
  },
  {
    fn: async () => {
      // The "#fix" import map only exists in the fixture package's own
      // package.json (a nested package scope), not in the repo root -
      // resolution must use the barrel file's nearest package.json.
      const barrelPath = path.join(fixtureBase, '..', 'importMapPkg', 'src', 'Barrel.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      const firstExport = exports[0]
      return { count: exports.length, first: firstExport }
    },
    expect: has.properties({
      count: 1,
      first: has.properties({
        name: 'Foo',
        path: path.join(fixtureBase, '..', 'importMapPkg', 'src', 'Foo.svelte'),
      }),
    }),
    info: 'getSvelteExports resolves #-prefixed sources against the nearest package.json (not CWD)',
  },
]
