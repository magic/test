import { is, tryCatch, promise } from '../src/index.js'

const cbFn = (e: Error | null, a: unknown, cb: (e: Error | null, a: unknown) => void) => cb(e, a)

export default {
  testRunBefore: {
    fn: () => true,
    before: () => {
      process.env.testVar = 't'
      return () => delete process.env.testVar
    },
    expect: () => process.env.testVar === 't',
    info: 'Test before function by setting process.env.testVar',
  },
  testRunAfter: {
    fn: () => {
      const cleanup = () => {
        const wasSet = process.env.testVar === 't'
        delete process.env.testVar
        return wasSet
      }
      process.env.testVar = 'after_test'
      return cleanup()
    },
    expect: true,
    info: 'Test cleanup function runs and cleans up process.env.testVar',
  },
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
      { fn: new Promise<void>(r => r()), expect: undefined, info: 'pass Promise into test fn' },
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
      fn: tryCatch(() => {
        throw Error('Oops')
      }, 'E_NO_EXISTS'),
      expect: is.error,
    },
  ],
  suiteFn: { fn: () => true, expect: true },
  suiteEmpty_ExpectingErrorInLog: null,
}
