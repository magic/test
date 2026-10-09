import is from '@magic/types'
import { parseTsConfig } from '#lib/svelte/viteConfig/parseTsConfig.js'

export default [
  {
    fn: () => parseTsConfig,
    expect: is.function,
    info: 'is a function',
  },
]
