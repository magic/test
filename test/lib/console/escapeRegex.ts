import { escapeRegex } from '#lib/svelte/viteConfig/escapeRegex.js'
import type { Test } from '#src/types.js'

export default [
  {
    fn: () => escapeRegex('abc'),
    expect: 'abc',
    info: 'no special chars',
  },
  {
    fn: () => escapeRegex('a.b*c'),
    expect: 'a\\.b\\*c',
    info: 'escapes dot and asterisk',
  },
  {
    fn: () => escapeRegex('[test](def)'),
    expect: '\\[test\\]\\(def\\)',
    info: 'escapes brackets and parens',
  },
  {
    fn: () => escapeRegex(''),
    expect: '',
    info: 'empty string',
  },
] satisfies Test[]
