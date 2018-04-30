const is = require('@magic/types')

const format = require('../src/format')

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

module.exports = [
  { fn: () => is.len.equal(format, expected) },
  { fn: () => Object.keys(format).every(k => format[k] === expected[k]) },
]
