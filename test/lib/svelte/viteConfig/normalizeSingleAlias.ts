import { normalizeSingleAlias } from '../../../../src/lib/svelte/viteConfig/normalizeSingleAlias.js'

export default [
  {
    fn: () => typeof normalizeSingleAlias === 'function',
    expect: true,
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
      return result.find instanceof RegExp && result.find.source === '^@'
    },
    expect: true,
    info: 'handles RegExp object as find value',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '@/*', replacement: './src/*' }, '/tmp')
      return result.find instanceof RegExp && result.replacement.endsWith('$1')
    },
    expect: true,
    info: 'handles wildcard pattern with * suffix',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '/^@\\/(.*)$/', replacement: './src/$1' }, '/tmp')
      return result.find instanceof RegExp
    },
    expect: true,
    info: 'handles regex literal string pattern',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: null, replacement: './src' }, '/tmp')
      return typeof result.find === 'string' && result.replacement.endsWith('/src')
    },
    expect: true,
    info: 'handles non-string find value',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '/[invalid/g', replacement: './src' }, '/tmp')
      return typeof result.find === 'string' && result.find === '/[invalid/g'
    },
    expect: true,
    info: 'handles invalid regex literal string',
  },
]
