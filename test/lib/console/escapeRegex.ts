import { escapeRegex } from '../../../src/lib/svelte/viteConfig/escapeRegex.js'
import type { Test } from '../../../src/types.js'

export default [
  {
    fn: () => escapeRegex('abc') === 'abc',
    expect: true,
    info: 'no special chars',
  },
  {
    fn: () => escapeRegex('a.b*c') === 'a\\.b\\*c',
    expect: true,
    info: 'escapes dot and asterisk',
  },
  {
    fn: () => escapeRegex('[test](def)') === '\\[test\\]\\(def\\)',
    expect: true,
    info: 'escapes brackets and parens',
  },
  {
    fn: () => escapeRegex('') === '',
    expect: true,
    info: 'empty string',
  },
] satisfies Test[]
