import {
  functionModifiesGlobals,
  testModifiesGlobals,
  suiteModifiesGlobals,
} from '#src/lib/globalCheck.js'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // Test function with globalThis
  {
    fn: () =>
      functionModifiesGlobals(() => {
        console.log(globalThis)
      }),
    expect: true,
    info: 'function with globalThis modifies globals',
  },
  // Test function with window
  {
    fn: () => functionModifiesGlobals(() => window.alert('hi')),
    expect: true,
    info: 'function with window modifies globals',
  },
  // Test function with global (nodejs)
  {
    fn: () =>
      functionModifiesGlobals(() => {
        // @ts-expect-error assigning to a non-existent global property
        global.someVar = 1
      }),
    expect: true,
    info: 'function with global modifies globals',
  },
  // Test function with self
  {
    fn: () =>
      functionModifiesGlobals(() => {
        // @ts-expect-error assigning a string to self.location
        self.location = 'http://evil.com'
      }),
    expect: true,
    info: 'function with self modifies globals',
  },
  // Test function with process.env
  {
    fn: () => functionModifiesGlobals(() => console.log(process.env)),
    expect: true,
    info: 'function with process.env modifies globals',
  },
  // Test function with property access
  {
    fn: () =>
      functionModifiesGlobals(() => {
        console.log(process.env.NODE_ENV)
      }),
    expect: true,
    info: 'function with process.env.NODE_ENV modifies globals',
  },
  // Test function without globals
  {
    fn: () =>
      functionModifiesGlobals(() => {
        console.log('hello world')
      }),
    expect: false,
    info: 'function without globals does not modify globals',
  },
  // Test function with empty string
  {
    fn: () => functionModifiesGlobals(() => {}),
    expect: false,
    info: 'function without global references does not modify globals',
  },
  // Test function with numeric literal
  {
    fn: () =>
      functionModifiesGlobals(() => {
        console.log(42)
      }),
    expect: false,
    info: 'function with literal does not modify globals',
  },
  // Test function with string literal
  {
    fn: () =>
      functionModifiesGlobals(() => {
        console.log('hello')
      }),
    expect: false,
    info: 'function with string literal does not modify globals',
  },
  // Test function with function that has no body
  {
    fn: () => functionModifiesGlobals(function () {}),
    expect: false,
    info: 'function without body does not modify globals',
  },
  // Test function with null
  {
    fn: () => functionModifiesGlobals(null),
    expect: false,
    info: 'null does not modify globals',
  },
  // Test function with undefined
  {
    fn: () => functionModifiesGlobals(undefined),
    expect: false,
    info: 'undefined does not modify globals',
  },
  // Test function with number
  {
    fn: () => functionModifiesGlobals(123),
    expect: false,
    info: 'number does not modify globals',
  },
  // Test function with string
  {
    fn: () => functionModifiesGlobals('not a function'),
    expect: false,
    info: 'string does not modify globals',
  },
  // Test function with object
  {
    fn: () => functionModifiesGlobals({}),
    expect: false,
    info: 'object does not modify globals',
  },
  // Test testModifiesGlobals with no hooks
  {
    fn: () => {
      const test = { fn: () => 1, before: undefined, after: undefined, expect: undefined }
      return testModifiesGlobals(test)
    },
    expect: false,
    info: 'test without hooks does not modify globals',
  },
  // Test testModifiesGlobals with fn that modifies globals
  {
    fn: () => {
      const test = {
        fn: () => {
          // @ts-expect-error assigning to a non-existent global property
          globalThis.foo = 1
        },
        before: undefined,
        after: undefined,
        expect: undefined,
      }
      return testModifiesGlobals(test)
    },
    expect: true,
    info: 'test with fn modifying globals',
  },
  // Test testModifiesGlobals with before hook that modifies globals
  {
    fn: () => {
      const test = {
        fn: undefined,
        before: () => {
          // @ts-expect-error assigning to a non-existent window property
          window.bar = 2
        },
        after: undefined,
        expect: undefined,
      }
      return testModifiesGlobals(test)
    },
    expect: true,
    info: 'test with before hook modifying globals',
  },
  // Test testModifiesGlobals with after hook that modifies globals
  {
    fn: () => {
      const test = {
        fn: undefined,
        before: undefined,
        after: () => {
          // @ts-expect-error assigning to a non-existent self property
          self.baz = 3
        },
        expect: undefined,
      }
      return testModifiesGlobals(test)
    },
    expect: true,
    info: 'test with after hook modifying globals',
  },
  // Test testModifiesGlobals with expect that modifies globals
  {
    fn: () => {
      const test = {
        fn: undefined,
        before: undefined,
        after: undefined,
        expect: () => {
          console.log(process.env)
        },
      }
      return testModifiesGlobals(test)
    },
    expect: true,
    info: 'test with expect modifying globals',
  },
  // Test suiteModifiesGlobals with single test
  {
    fn: () => {
      const tests = {
        test: {
          fn: () => {
            // @ts-expect-error assigning to a non-existent global property
            globalThis.test = 1
          },
          before: undefined,
          after: undefined,
          expect: undefined,
        },
      }
      return suiteModifiesGlobals(tests)
    },
    expect: true,
    info: 'suite with test modifying globals',
  },
  // Test suiteModifiesGlobals with multiple tests, one modifies globals
  {
    fn: () => {
      const tests = {
        test1: { fn: () => 1, before: undefined, after: undefined, expect: undefined },
        test2: {
          fn: () => {
            // @ts-expect-error assigning to a non-existent window property
            window.test2 = 2
          },
          before: undefined,
          after: undefined,
          expect: undefined,
        },
      }
      return suiteModifiesGlobals(tests)
    },
    expect: true,
    info: 'suite with multiple tests, one modifies globals',
  },
  // Test suiteModifiesGlobals with empty suite
  {
    fn: () => {
      const tests = {}
      return suiteModifiesGlobals(tests)
    },
    expect: false,
    info: 'empty suite does not modify globals',
  },
  // Test suiteModifiesGlobals with suite with no modifying functions
  {
    fn: () => {
      const tests = {
        test1: { fn: () => 1, before: () => {}, after: () => {}, expect: () => 1 },
      }
      return suiteModifiesGlobals(tests)
    },
    expect: false,
    info: 'suite with only clean functions does not modify globals',
  },
  // Test suiteModifiesGlobals with beforeAll hook modifying globals
  {
    fn: () => {
      const tests = {
        beforeAll: () => {
          // @ts-expect-error assigning to a non-existent global property
          globalThis.suiteHook = 1
        },
        tests: { test: { fn: () => 1, before: undefined, after: undefined, expect: undefined } },
      }
      return suiteModifiesGlobals(tests)
    },
    expect: true,
    info: 'suite with beforeAll hook modifying globals',
  },
  // Test suiteModifiesGlobals with afterAll hook modifying globals
  {
    fn: () => {
      const tests = {
        afterAll: () => {
          process.env.AFTERALL = 'set'
        },
        tests: { test: { fn: () => 1, before: undefined, after: undefined, expect: undefined } },
      }
      return suiteModifiesGlobals(tests)
    },
    expect: true,
    info: 'suite with afterAll hook modifying globals',
  },
]

export default tests
