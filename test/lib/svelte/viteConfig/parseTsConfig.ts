import { parseTsConfig } from '../../../../src/lib/svelte/viteConfig/parseTsConfig.js'

export default [
  {
    fn: () => typeof parseTsConfig === 'function',
    expect: true,
    info: 'is a function',
  },
]
