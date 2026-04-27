import { parseViteConfig } from '../../../../src/lib/svelte/viteConfig/parseViteConfig.js'

export default [
  {
    fn: () => typeof parseViteConfig === 'function',
    expect: true,
    info: 'is a function',
  },
]
