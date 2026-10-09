import path from 'node:path'
import { fileURLToPath } from 'node:url'
import is from '@magic/types'
import { compileSvelteWithImports } from '#lib/svelte/compile/compileSvelteWithImports.js'

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
  'components',
  'Button.svelte',
)

export default [
  {
    fn: () => compileSvelteWithImports,
    expect: is.fn,
    info: 'compileSvelteWithImports is exported and is a function',
  },
  {
    fn: async () => {
      const result = await compileSvelteWithImports(fixtureBase)
      return is.objectNative(result) && 'js' in result && 'css' in result
    },
    expect: true,
    info: 'compileSvelteWithImports resolves {js, css} for a real component',
  },
  {
    fn: async () => {
      const result = await compileSvelteWithImports(fixtureBase)
      return result.js
    },
    expect: is.string,
    info: 'compileSvelteWithImports js is a string',
  },
  {
    fn: async () => {
      const result = await compileSvelteWithImports(fixtureBase)
      return result.js
    },
    expect: is.len.smaller(0),
    info: 'compileSvelteWithImports js is a non-empty string',
  },
]
