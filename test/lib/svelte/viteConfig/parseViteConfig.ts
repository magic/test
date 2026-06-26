import is from '@magic/types'
import { parseViteConfig } from '../../../../src/lib/svelte/viteConfig/parseViteConfig.js'

export default [
  {
    fn: () => parseViteConfig,
    expect: is.function,
    info: 'is a function',
  },
]
