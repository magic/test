const is = require('@magic/types')

process.env.testVar = ''
// test before function
const before = t => {
  process.env.testVar += 't'

  // before returns the after function
  return () => {
    delete process.env.testVar
  }
}

const fns = {
  // test possible test structure
  before: [
    {
      fn: () => true,
      before,
      expect: () => process.env.testVar === 't',
      info: 'Test before function by setting process.env.testVar',
    },
  ],
  after: [
    {
      fn: async () => new Promise(r => setTimeout(r, 10)),
      expect: () => !process.env.testVar,
      info: 'After should have deleted process.env.testVar',
    },
  ],
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
      { fn: () => ({}), expect: is.object },
    ],
  },
  testInvalidTests: [
    {
      fn: () => {
        try {
          return run('INVALID')
        } catch (e) {
          return e
        }
      },
      expect: e => e instanceof Error,
    },
  ],
  suiteFn: { fn: () => true, expect: true },
  suiteEmpty: null,
}

module.exports = fns
