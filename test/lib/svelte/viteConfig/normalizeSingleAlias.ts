import { normalizeSingleAlias } from '../../../../src/lib/svelte/viteConfig/normalizeSingleAlias.js'

export default [
  {
    fn: () => typeof normalizeSingleAlias === 'function',
    expect: true,
    info: 'is a function',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '@', replacement: './src' }, '/tmp')
      return result.find === '@' && result.replacement === '/tmp/src'
    },
    expect: true,
    info: 'resolves relative replacement path',
  },
]
