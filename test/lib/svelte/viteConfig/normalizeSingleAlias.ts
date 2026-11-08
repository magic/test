import is from '@magic/types'
import { has } from '#lib/has.js'
import { normalizeSingleAlias } from '#lib/svelte/viteConfig/normalizeSingleAlias.js'

export default [
  {
    fn: () => normalizeSingleAlias,
    expect: is.function,
    info: 'is a function',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '@', replacement: './src' }, '/tmp')
      return result
    },
    expect: has.properties({ find: '@', replacement: '/tmp/src' }),
    info: 'resolves relative replacement path',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: /^@/, replacement: './src' }, '/tmp')
      return result.find
    },
    expect: [is.regex, has.properties({ source: '^@' })],
    info: 'handles RegExp object as find value',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '@/*', replacement: './src/*' }, '/tmp')
      return result
    },
    expect: [
      has.properties({ find: is.regex }),
      (v: { replacement: string }) => v.replacement.endsWith('$1'),
    ],
    info: 'handles wildcard pattern with * suffix',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '/^@\\/(.*)$/', replacement: './src/$1' }, '/tmp')
      return result.find
    },
    expect: is.regex,
    info: 'handles regex literal string pattern',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: null, replacement: './src' }, '/tmp')
      return result
    },
    expect: [
      has.properties({ find: is.str }),
      (v: { replacement: string }) => v.replacement.endsWith('/src'),
    ],
    info: 'handles non-string find value',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '/[invalid/g', replacement: './src' }, '/tmp')
      return result.find
    },
    expect: [is.str, '/[invalid/g'],
    info: 'handles invalid regex literal string',
  },
]
