const vals = require('../src/vals')

const deep = require('deep')

// collection of javascript types to test anything against
// => copied from ../src/vals.js

// copy vals
const testVals = Object.assign({}, vals)
const invalidTestVals = Object.assign({}, testVals, { t: 't'})

const fn = [
  { fn: () => deep.equals(testVals, vals), expect: true },
  { fn: () => deep.equals(invalidTestVals, vals), expect: false },
]

module.exports = fn
