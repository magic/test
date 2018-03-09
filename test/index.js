const run = require('../src')

const t = require('./t')

const expectTrue = {
  fn: () => true,
  expect: true,
}

const expectFalse = {
  fn: () => false,
  expect: false,
}

const tests = {
  t,

  // test possible test structure
  testNestedObject: {
    nestedSingleTest: expectTrue,
    deeper: {
      rabbit: [
        expectTrue,
        expectFalse,
      ],
    },
  },
  testNestedArray: [
    expectTrue,
    expectFalse,
  ],
}

run(tests)
