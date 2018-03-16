const { isObject } = require('types')

const run = require('../src')
const vals = require('./vals')
const cleanFunctionString = require('./lib/cleanFunctionString')

const tests = {
  vals,
  cleanFunctionString,

  // test possible test structure
  testNestedObject: {
    nestedSingleTest: { fn: () => 1, expect: 1 },
    deeper: {
      rabbit: [
        { fn: () => 1, expect: 1 },
        { fn: () => false, expect: false },
        { fn: () => 'string', expect: 'string' },
      ],
    },
  },
  testNestedArray: {
    arr: [
      { fn: () => true, expect: true },
      { fn: () => false, expect: false },
      { fn: () => ({}), expect: isObject },
    ],
  },
}

run(tests)
