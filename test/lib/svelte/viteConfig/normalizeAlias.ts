import is from '@magic/types'
import { normalizeAlias } from '../../../../src/lib/svelte/viteConfig/normalizeAlias.js'

export default [
  {
    fn: () => normalizeAlias,
    expect: is.fn,
    info: 'is a function',
  },
  {
    fn: normalizeAlias({}, '.'),
    expect: is.arr,
    info: 'returns an array for empty object',
  },
  {
    fn: () => normalizeAlias({ '@': './src' }, '/tmp'),
    expect: is.len.eq(1),
    info: 'returns array with one entry for alias object',
  },
]
