const is = require('@magic/types')

const { promise, tryCatch } = require('../src')

process.env.testVar = ''
// test before function
const before = t => {
  process.env.testVar += 't'

  // before returns the after function
  return () => {
    delete process.env.testVar
  }
}

const cbFn = (e, a, cb) => cb(e, a)

module.exports = {
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
  argumentTypes: {
    primitive: [
      { fn: true, info: 'can pass literal value into test fn' },
      { fn: false, expect: false, info: 'can pass literal value into test fn' },
      { fn: 'test', expect: 'test', info: 'can pass literal value into test fn' },
    ],
    function: [
      { fn: () => true, info: 'can pass function into fn' },
      { fn: () => false, expect: false, info: 'can pass function into fn' },
      { fn: () => 't', expect: 't', info: 'can pass function into fn' },
      { fn: true, expect: () => true, info: 'can pass function into expect' },
      { fn: false, expect: () => false, info: 'can pass function into expect' },
      { fn: 't', expect: () => 't', info: 'can pass function into expect' },
      { fn: () => true, expect: () => true, info: 'can pass function into fn and expect' },
      { fn: () => false, expect: () => false, info: 'can pass function into fn and expect' },
      { fn: () => 't', expect: () => 't', info: 'can pass function into fn and expect' },
      { fn: 'test', expect: 'test', info: 'can pass literal value into test fn' },
    ],
    promise: [
      { fn: new Promise(r => r(true)), info: 'pass Promise into test fn' },
      { fn: new Promise(r => r()), expect: undefined, info: 'pass Promise into test fn' },
      { fn: new Promise(r => r('t')), expect: 't', info: 'pass Promise into test fn' },
      { fn: true, expect: new Promise(r => r(true)), info: 'pass Promise into expect' },
      { fn: false, expect: new Promise(r => r(false)), info: 'pass Promise into expect' },
      { fn: 't', expect: new Promise(r => r('t')), info: 'pass Promise into expect' },
    ],
    callback: [
      { fn: promise(r => cbFn(null, 't', r)), expect: 't', info: 'can handle cbs in fn' },
      { fn: true, expect: promise(r => cbFn(null, true, r)), info: 'can handle cbs in expect' },
      {
        fn: promise(r => cbFn(null, true, r)),
        expect: promise(r => cbFn(null, true, r)),
        info: 'can handle cbs in fn and expect',
      },
    ],
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
  suiteEmpty_ExpectingErrorInLog: null,
}
