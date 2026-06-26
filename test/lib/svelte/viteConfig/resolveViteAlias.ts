import is from '@magic/types'
import { resolveViteAlias } from '../../../../src/lib/svelte/viteConfig/resolveViteAlias.js'

export default [
  {
    fn: () => resolveViteAlias,
    expect: is.function,
    info: 'is a function',
  },
]
