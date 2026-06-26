export const View = state => [
  h1({ id: 'writing-tests' }, 'Writing Tests'),

  h2({ id: 'tests' }, 'Single Test'),

  p('A test can be a literal value, function, or promise:'),

  Pre(`
export default { fn: true, expect: true, info: 'expect true to be true' }

// expect: true is the default and can be omitted
export default { fn: true, info: 'expect true to be true' }

// if fn is a function, expect is the returned value of the function
export default { fn: () => false, expect: false, info: 'expect true to be true' }

// if expect is a function, the return value of the test gets passed to it
export default { fn: false, expect: t => t === false, info: 'expect true to be true' }

// if fn is a promise, the resolved value will be returned
export default { fn: new Promise(r => r(true)), expect: true, info: 'promise resolves to true' }

// if expect is a promise, it will resolve before being compared to the fn return value
export default { fn: true, expect: new Promise(r => r(true)), info: 'expect is a promise' }

// callback functions can be tested easily too:
import { promise } from '@magic/test'
const fnWithCallback = (err, arg, cb) => cb(err, arg)
export default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }
`),

  h2({ id: 'tests-multiple' }, 'Multiple Tests'),

  p('Multiple tests can be created by exporting an array or object of single test objects.'),

  Pre(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]
`),

  p('Or exporting an object with named test arrays:'),

  Pre(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}
`),

  h2({ id: 'tests-runs' }, 'Running Tests Multiple Times'),

  p('Use the `runs` property to run a test multiple times:'),

  Pre(`
import { is } from '@magic/test'

export default [
  {
    fn: Math.random(),
    expect: is.number,
    runs: 5,
    info: 'runs the test 5 times and expects all returns to be numbers',
  },
]
`),

  h2({ id: 'tests-types' }, 'Testing Types'),

  p([
    'Types can be compared using ',
    Link({ to: 'https://github.com/magic/types', text: '@magic/types' }),
  ]),

  p([
    '@magic/types is a richly featured and thoroughly tested type library without dependencies.',
    ' It is exported from this library for convenience.',
  ]),

  Pre(`
import { is } from '@magic/test'

export default [
  { fn: () => 'string',
    expect: is.string,
    info: 'test if a function returns a string'
  },
  {
    fn: () => 'string',
    expect: is.length.equal(6),
    info: 'test length of returned value'
  },
  // Testing for deep equality. simple.
  {
    fn: () => [1, 2, 3],
    expect: is.deep.equal([1, 2, 3]),
    info: 'deep compare arrays/objects for equality',
  },
  {
    fn: () => ({ key: 1 }),
    expect: is.deep.different({ value: 1 }),
    info: 'deep compare arrays/objects for difference',
  },
]
`),

  h3({ id: 'caveat' }, 'Caveat'),

  p([
    'If you want to test if a function is a function, you need to wrap the function in a function.',
    ' This is because functions passed to fn get executed automatically.',
  ]),

  Pre(`
import { is } from '@magic/test'

const fnToTest = () => {}

export default [
  {
    fn: () => fnToTest,
    expect: is.function,
    info: 'function is a function',
  },
]
`),

  h2({ id: 'tests-typescript' }, 'TypeScript Support'),

  p([
    '@magic/test supports TypeScript test files.',
    ' You can write tests in .ts files and they will be executed directly without transpilation.',
  ]),

  Pre(`
import type { Test } from '@magic/test'

export default [
  { fn: () => true, expect: true, info: 'TypeScript test works!' }
] satisfies Test[]
`),

  p('This requires Node.js 22.18.0 or later.'),

  h2({ id: 'tests-promises' }, 'Promises'),

  Pre(`
import { promise, is } from '@magic/test'

export default [
  // kinda clumsy, but works. until you try handling errors.
  {
    fn: new Promise(cb => setTimeout(() => cb(true), 2000)),
    expect: true,
    info: 'handle promises',
  },
  // better!
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 200)),
    expect: true,
    info: 'handle promises in a nicer way',
  },
  {
    fn: promise(cb => setTimeout(() => cb(new Error('error')), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),

  h2({ id: 'tests-cb' }, 'Callback Functions'),

  Pre(`
import { promise, is } from '@magic/test'

const fnWithCallback = (err, arg, cb) => cb(err, arg)

export default [
  {
    fn: promise(cb => fnWithCallback(null, true, cb)),
    expect: true,
    info: 'handle callback functions as promises',
  },
  {
    fn: promise(cb => fnWithCallback(new Error('oops'), true, cb)),
    expect: is.error,
    info: 'handle callback function error as promise',
  },
]
`),

  h2({ id: 'tests-hooks' }, 'Hooks'),

  h3({}, 'Individual Test Hooks'),

  p('Run functions before and/or after individual tests:'),

  Pre(`
const after = () => {
  global.testing = 'Test has finished, cleanup.'
}

const before = () => {
  global.testing = false

  // if a function gets returned,
  // this function will be executed once the test finishes.
  return after
}

export default [
  {
    fn: () => { global.testing = 'changed in test' },
    before,
    after,
    expect: () => global.testing === 'changed in test',
  },
]
`),

  h3({ id: 'tests-suite-hooks' }, 'Suite Hooks'),

  p('Run functions before and/or after a suite of tests:'),

  Pre(`
const afterAll = () => {
  global.testing = undefined
}

const beforeAll = () => {
  global.testing = false

  // if a function gets returned,
  // this function will be executed once the test suite finishes.
  return afterAll
}

export default {
  beforeAll,
  // this is optional if beforeAll returns a function
  afterAll,
  tests: [
    {
      fn: () => { global.testing = 'changed in test' },
      expect: () => global.testing === 'changed in test',
    },
  ],
}
`),

  p([
    'Note: Suites that use beforeAll, afterAll, beforeEach or afterEach',
    ' will run in a worker to make sure globals are not polluted for other suites.',
  ]),

  h4({}, 'File-based Hooks'),

  p([
    'You can also create test/beforeAll.js and test/afterAll.js files',
    ' that run before/after all tests.',
  ]),

  p(
    '**Note:** These files must be placed at the **root** `test/` directory (not in subdirectories).',
  ),

  Pre(`
// test/beforeAll.js
export default () => {
  global.setup = true
  // optionally return a cleanup function
  return () => {
    global.setup = false
  }
}
`),

  Pre(`
// test/afterAll.js
export default () => {
  // cleanup after all tests
}
`),

  h3({ id: 'tests-each-hooks' }, 'beforeEach and afterEach'),

  p('Define beforeEach and afterEach hooks that run before/after each individual test:'),

  Pre(`
const beforeEach = () => {
  // Runs before each test in this suite
  global.testState = { initialized: true }
}

const afterEach = () => {
  // Runs after each test
  global.testState = null
}

export default {
  beforeEach,
  afterEach,
  tests: [
    { fn: () => global.testState.initialized, expect: true },
    { fn: () => true, expect: true },
  ],
}
`),

  h2({ id: 'tests-magic-modules' }, 'Magic Modules'),

  p([
    '@magic-modules assume all HTML tags to be globally defined.',
    ' To create those globals for your test and check if a @magic-module returns the correct markup,',
    ' just use one of those tags in your tests.',
  ]),

  Pre(`
const expect = [
  'i',
  [
    { class: 'testing' },
    'testing',
  ],
]

const props = { class: 'testing' }

export default [
  {
    fn: () => i(props, 'testing'),
    expect,
    info: 'magic/test can now test html',
  },
]
`),

  h2({ id: 'test-suites' }, 'Test Suites'),

  p('Expectations for optimal test messages:'),

  ul([
    li('src and test directories have the same structure and files'),
    li('tests one src file per test file'),
    li('tests one function per suite'),
    li('tests one feature per test'),
  ]),

  h3({}, 'Filesystem Based Naming'),

  p('The following directory structure:'),

  Pre(`./test/
  ./suite1.js
  ./suite2.js`),

  p('yields the same result as exporting the following from ./test/index.js:'),

  Pre(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}
`),

  h3({}, 'Data Driven Naming'),

  p('Export test structure directly from index.js:'),

  Pre(`
export default {
  suite1: [
    { fn: () => true, expect: true },
  ],
  suite2: [
    { fn: () => false, expect: false },
  ],
}
`),

  h3({ id: 'tests-file-mappings' }, 'Important File Mappings'),

  p([
    'If test/index.js exists, no other files will be loaded.',
    ' If test/lib/index.js exists, no other files from that subdirectory will be loaded.',
    ' Instead, the exports of those index.js will be expected to be tests.',
  ]),
]
