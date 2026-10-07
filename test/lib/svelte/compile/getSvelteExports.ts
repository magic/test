import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import { getSvelteExports } from '#src/lib/svelte/compile/getSvelteExports.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureBase = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'test',
  '.fixtures',
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
  {
    fn: async () => {
      // "#-prefixed" re-export sources are package.json import-map entries
      // ("#test/*": "./test/*" in package.json), not relative paths -
      // resolving them against the barrel directory produced bogus paths
      // like "test/.fixtures/#test/.fixtures/...".
      const barrelPath = path.join(fixtureBase, 'ImportMapBarrel.svelte.js')
      const exports = await getSvelteExports(barrelPath)
      const firstExport = exports[0]
      return (
        exports.length === 1 &&
        firstExport != null &&
        firstExport.name === 'TestComponent' &&
        firstExport.path === path.join(fixtureBase, 'TestComponent.svelte') &&
        fs.existsSync(firstExport.path)
      )
    },
    expect: true,
    info: 'getSvelteExports resolves #-prefixed import-map sources against package.json imports',
  },
  {
    fn: async () => {
      // The "#fix" import map only exists in the fixture package's own
      // package.json (a nested package scope), not in the repo root -
      // resolution must use the barrel file's nearest package.json.
      const barrelPath = path.join(fixtureBase, '..', 'importMapPkg', 'src', 'Barrel.svelte.js')
      const expected = path.join(fixtureBase, '..', 'importMapPkg', 'src', 'Foo.svelte')
      const exports = await getSvelteExports(barrelPath)
      const firstExport = exports[0]
      return (
        exports.length === 1 &&
        firstExport != null &&
        firstExport.name === 'Foo' &&
        firstExport.path === expected
      )
    },
    expect: true,
    info: 'getSvelteExports resolves #-prefixed sources against the nearest package.json (not CWD)',
  },
]
