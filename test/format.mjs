import is from '@magic/types'

import format from '../src/format/index.mjs'

// do not change this object!
const expected = {
  semi: false,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'avoid',
}

export default [
  { fn: () => is.len.equal(format, expected) },
  { fn: () => Object.keys(format).every(k => format[k] === expected[k]) },
]
