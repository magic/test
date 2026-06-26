import is from '@magic/types'
import { resolveAlias } from '../../../../src/lib/svelte/viteConfig/resolveAlias.js'

export default [
  {
    fn: () => resolveAlias,
    expect: is.function,
    info: 'is a function',
  },
]
