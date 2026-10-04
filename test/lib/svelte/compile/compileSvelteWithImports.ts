import path from 'node:path'
import { fileURLToPath } from 'node:url'
import is from '@magic/types'
import { compileSvelteWithImports } from '#src/lib/svelte/compile/compileSvelteWithImports.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixture = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'test',
  '.fixtures',
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
      const result = await compileSvelteWithImports(fixture)
      return is.objectNative(result) && 'js' in result && 'css' in result
    },
    expect: true,
    info: 'compileSvelteWithImports resolves {js, css} for a real component',
  },
  {
    fn: async () => {
      const result = await compileSvelteWithImports(fixture)
      return is.string(result.js) && result.js.length > 0
    },
    expect: true,
    info: 'compileSvelteWithImports js is a non-empty string',
  },
]
