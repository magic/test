import { normalizeAlias } from '../../src/lib/svelte/viteConfig/normalizeAlias.js'
import { normalizeSingleAlias } from '../../src/lib/svelte/viteConfig/normalizeSingleAlias.js'

export default [
  {
    fn: () => normalizeAlias([], '/root'),
    expect: [],
    info: 'returns empty array for empty array input',
  },
  {
    fn: () => {
      const result = normalizeAlias([{ find: '@', replacement: './src' }], '/root')
      return result.length
    },
    expect: 1,
    info: 'normalizes array-style alias entries',
  },
  {
    fn: () => {
      const result = normalizeAlias({ '@': './src', '~': './components' }, '/root')
      return result.length
    },
    expect: 2,
    info: 'normalizes object-style alias entries (lines 12-16)',
  },
  {
    fn: () => {
      const result = normalizeAlias({ '@': './src' }, '/root')
      return result[0]
    },
    expect: { find: '@', replacement: '/root/src' },
    info: 'object alias resolves relative to configDir',
  },
  {
    fn: () => normalizeAlias(null, '/root'),
    expect: [],
    info: 'returns empty array for null input',
  },
  {
    fn: () => normalizeAlias(undefined, '/root'),
    expect: [],
    info: 'returns empty array for undefined input',
  },
  {
    fn: () => normalizeAlias('string', '/root'),
    expect: [],
    info: 'returns empty array for string input',
  },
  // Additional tests to cover normalizeSingleAlias uncovered lines
  {
    fn: () => {
      const result = normalizeSingleAlias(
        { find: '/invalid[regex/', replacement: './src' },
        '/root',
      )
      return result.find
    },
    expect: '/invalid[regex/',
    info: 'returns string for invalid regex pattern (lines 22-27 try/catch)',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '/^test.*/', replacement: './src' }, '/root')
      return result.find instanceof RegExp
    },
    expect: true,
    info: 'converts valid regex string to RegExp (lines 28-31)',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '/^test(.*)/', replacement: './src/$1' }, '/root')
      return result.replacement
    },
    expect: '/root/src/$1',
    info: 'handles wildcard with regex find (lines 34-44)',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '@/*', replacement: './src/*' }, '/root')
      return result.find instanceof RegExp
    },
    expect: true,
    info: 'converts wildcard find to RegExp',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '@/*', replacement: './src/*' }, '/root')
      return result.replacement
    },
    expect: '/root/src/$1',
    info: 'wildcard replacement includes $1',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: 123, replacement: './src' }, '/root')
      return result.find
    },
    expect: '123',
    info: 'converts non-string/non-regex find to string (lines 52-53)',
  },
  {
    fn: () => {
      const result = normalizeSingleAlias({ find: '@', replacement: 456 }, '/root')
      return result.replacement
    },
    expect: '/root/456',
    info: 'converts non-string replacement and resolves relative',
  },
]
