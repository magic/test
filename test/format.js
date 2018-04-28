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

const lengthEqual = (a, b) => Object.keys(a).length === Object.keys(b).length

module.exports = [
  { fn: () => lengthEqual(format, expected) },
  { fn: () => Object.keys(format).every(k => format[k] === expected[k]) },
]
