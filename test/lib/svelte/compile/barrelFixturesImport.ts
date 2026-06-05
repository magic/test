import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { mount } from '../../../../src/svelte.js'
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

const IndexSvelteJsPath = path.join(fixtureBase, 'Index.svelte.js')
const DefaultBarrelPath = path.join(fixtureBase, 'DefaultBarrel.svelte.js')
const TypeExportsPath = path.join(fixtureBase, 'TypeExports.svelte.js')
const EmptyBarrelPath = path.join(fixtureBase, 'EmptyBarrel.svelte.js')
const DefaultExportPath = path.join(fixtureBase, 'DefaultExport.svelte')
const TestComponentPath = path.join(fixtureBase, 'TestComponent.svelte')
const TitleComponentPath = path.join(fixtureBase, 'TitleComponent.svelte')

const IndexSvelteJs = await import(IndexSvelteJsPath)
const DefaultBarrel = await import(DefaultBarrelPath)
const TypeExports = await import(TypeExportsPath)
const EmptyBarrel = await import(EmptyBarrelPath)

const defaultExportResult = await mount(DefaultExportPath)
const defaultExportHtml = defaultExportResult.target.innerHTML
await defaultExportResult.unmount()

const testComponentResult = await mount(TestComponentPath)
const testComponentHtml = testComponentResult.target.innerHTML
await testComponentResult.unmount()

const titleComponentResult = await mount(TitleComponentPath)
const titleComponentHtml = titleComponentResult.target.innerHTML
await titleComponentResult.unmount()

export default [
  {
    fn: () => is.object(IndexSvelteJs),
    expect: true,
    info: 'Index.svelte.js module loads correctly',
  },
  {
    fn: () => is.object(DefaultBarrel),
    expect: true,
    info: 'DefaultBarrel.svelte.js module loads correctly',
  },
  {
    fn: () => is.object(TypeExports),
    expect: true,
    info: 'TypeExports.svelte.js module loads correctly',
  },
  {
    fn: () => is.object(EmptyBarrel),
    expect: true,
    info: 'EmptyBarrel.svelte.js module loads correctly',
  },
  {
    fn: async () => {
      return 'TestComponent' in IndexSvelteJs || 'TitleComponent' in IndexSvelteJs
    },
    expect: true,
    info: 'Index.svelte.js has expected exports',
  },
  {
    fn: async () => {
      return 'default' in DefaultBarrel || 'NamedComponent' in DefaultBarrel
    },
    expect: true,
    info: 'DefaultBarrel.svelte.js has expected exports',
  },
  {
    fn: async () => {
      return 'Component' in TypeExports || 'TitleComponent' in TypeExports
    },
    expect: true,
    info: 'TypeExports.svelte.js has expected exports',
  },
  {
    fn: () => typeof defaultExportHtml === 'string' && defaultExportHtml.length > 0,
    expect: true,
    info: 'DefaultExport.svelte renders to html',
  },
  {
    fn: () => typeof testComponentHtml === 'string' && testComponentHtml.length > 0,
    expect: true,
    info: 'TestComponent.svelte renders to html',
  },
  {
    fn: () => typeof titleComponentHtml === 'string' && titleComponentHtml.length > 0,
    expect: true,
    info: 'TitleComponent.svelte renders to html',
  },
]
