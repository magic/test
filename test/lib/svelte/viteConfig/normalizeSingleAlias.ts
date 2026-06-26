import is from '@magic/types'
import { normalizeSingleAlias } from '../../../../src/lib/svelte/viteConfig/normalizeSingleAlias.js'

export default [
  {
    fn: () => normalizeSingleAlias,
    expect: is.function,
    info: 'is a function',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '@', replacement: './src' }, '/tmp')
      return result.find === '@' && result.replacement === '/tmp/src'
    },
    expect: true,
    info: 'resolves relative replacement path',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: /^@/, replacement: './src' }, '/tmp')
      return is.regex(result.find) && result.find.source === '^@'
    },
    expect: true,
    info: 'handles RegExp object as find value',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '@/*', replacement: './src/*' }, '/tmp')
      return is.regex(result.find) && result.replacement.endsWith('$1')
    },
    expect: true,
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
      return is.string(result.find) && result.replacement.endsWith('/src')
    },
    expect: true,
    info: 'handles non-string find value',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '/[invalid/g', replacement: './src' }, '/tmp')
      return is.string(result.find) && result.find === '/[invalid/g'
    },
    expect: true,
    info: 'handles invalid regex literal string',
  },
]
