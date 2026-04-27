import { resolveViteAlias } from '../../../../src/lib/svelte/viteConfig/resolveViteAlias.js'

export default [
  {
    fn: () => typeof resolveViteAlias === 'function',
    expect: true,
    info: 'is a function',
  },
]
