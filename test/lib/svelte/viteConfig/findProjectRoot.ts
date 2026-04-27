import is from '@magic/types'
import { findProjectRoot } from '../../../../src/lib/svelte/viteConfig/findProjectRoot.js'

export default [
  {
    fn: () => typeof findProjectRoot === 'function',
    expect: true,
    info: 'is a function',
  },
  {
    fn: async () => {
      const result = await findProjectRoot('/nonexistent/path')
      return result
    },
    expect: process.cwd(),
    info: 'returns cwd when no package.json found',
  },
  {
    fn: async () => {
      const result = await findProjectRoot(process.cwd())
      return result
    },
    expect: is.str,
    info: 'returns a string path',
  },
]
