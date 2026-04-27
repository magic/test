import { resolveAlias } from '../../../../src/lib/svelte/viteConfig/resolveAlias.js'

export default [
  {
    fn: () => typeof resolveAlias === 'function',
    expect: true,
    info: 'is a function',
  },
]
