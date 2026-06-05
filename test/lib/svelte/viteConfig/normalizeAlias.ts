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
  {
    fn: () => normalizeAlias(null, '/tmp'),
    expect: is.arr,
    info: 'returns empty array for non-array/non-object input',
  },
  {
    fn: () => normalizeAlias('not an array', '/tmp'),
    expect: is.arr,
    info: 'returns empty array for string input',
  },
  {
    fn: () => normalizeAlias(42, '/tmp'),
    expect: is.arr,
    info: 'returns empty array for number input',
  },
]
