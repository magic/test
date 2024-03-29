export const View = state => [
  h1({ id: 'magictest' }, '@magic/test'),

  p([
    'simple tests with lots of utility.',
    ' ecmascript modules only.',
    ' runs ecmascript module syntax tests without transpilation.',
    ' unbelievably fast.',
  ]),

  GitBadges('@magic/test'),

  h2({ id: 'getting-started' }, 'getting started'),
  p('be in a nodejs project.'),

  h3({ id: 'getting-started-install' }, 'install'),
  Pre({ lines: 'false' }, 'npm i --save-dev --save-exact @magic/test'),

  h3('Create a test'),

  Pre(`
// create test/functionName.mjs
import yourTest from '../path/to/your/file.mjs'

export default [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the yourTest function will be called automagically
  { fn: yourTest, expect: true, info: 'hope this will work ;)'}
]
`),

  h3({ id: 'getting-started-npm-scripts' }, 'npm scripts'),

  p('edit package.json'),

  Pre(`
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
  }
}
`),

  p('repeated for easy copy pasting (without comments and trailing commas)'),

  Pre(`
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
`),

  h3({ id: 'getting-started-quick-tests' }, 'quick tests'),

  p('without coverage'),

  Pre(`
  // run the tests:
npm test

// example output:
// (failing tests will print, passing tests are silent)

// ### Testing package: @magic/test
// Ran 2 tests. Passed 2/2 100%
`),

  h3({ id: 'getting-started-coverage' }, 'coverage'),
  p([
    '@magic/test will automagically generate coverage reports',
    ' if it is not called with the -p flag.',
  ]),

  h3({ id: 'test-suites' }, 'data/fs driven test suite creation:'),

  h4({ id: 'expectations-for-optimal-test-messages' }, 'expectations for optimal test messages:'),
  ul([
    li('src and test directories have the same directory structure and filenames'),
    li('tests one src file per test file'),
    li('tests one function per test suite'),
    li('tests one feature per test unit'),
  ]),

  h4({ id: 'test-suites-fs' }, 'Filesystem based naming'),

  p('the following directory structure:'),

  Pre(`./test/
  ./suite1.mjs
  ./suite2.mjs`),
  p('yields the same result as exporting the following from ./test/index.mjs'),

  h4({ id: 'test-suites-data' }, 'Data driven naming'),

  Pre(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}`),

  h3({ id: 'important---file-mappings' }, 'Important - File mappings'),

  p([
    'if test/index.mjs exists, no other files will be loaded.',
    ' if test/index.mjs exists, no other files from that directory will be loaded,',
    ' if test/lib/index.mjs, no other files from that subdirectory will be loaded.',
    ' instead the exports of those index.mjs will be expected to be tests',
  ]),

  h3({ id: 'tests' }, 'single test'),
  p('literal value, function or promise'),

  Pre(`
export default { fn: true, expect: true, info: 'expect true to be true' }

// expect: true is the default and can be omitted
export default { fn: true, info: 'expect true to be true' }

// if fn is a function expect is the returned value of the function
export default { fn: () => false, expect: false, info: 'expect true to be true' }

// if expect is a function the return value of the test get passed to it
export default { fn: false, expect: t => t === false, info: 'expect true to be true' }

// if fn is a promise the resolved value will be returned
export default { fn: new Promise(r => r(true)), expect: true, info: 'expect true to be true' }

// if expects is a promise it will resolve before being compared to the fn return value
export default { fn: true, expect: new Promise(r => r(true)), info: 'expect true to be true' }

// callback functions can be tested easily too:
import { promise } from '@magic/test'

const fnWithCallback = (err, arg, cb) => cb(err, arg)

export default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: "arg" }
`),

  h4({ id: 'tests-types' }, 'testing types'),

  p([
    'types can be compared using ',
    Link({ to: 'https://github.com/magic/types', text: '@magic/types' }),
  ]),

  p([
    '@magic/types is a richly featured and thoroughly tested type library without dependencies.',
    ' it is exported from this library for convenience.',
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
  // !!! Testing for deep equality. simple.
  {
    fn: () => [1, 2, 3],
    expect: is.deep.equal([1, 2, 3]),
    info: 'deep compare arrays/objects for equality',
  },
  {
    fn: () => { key: 1 },
    expect: is.deep.different({ value: 1 }),
    info: 'deep compare arrays/objects for difference',
  },
]
`),

  h4({ id: 'caveat' }, 'caveat:'),

  p([
    'if you want to test if a function is a function, you need to wrap the function in a function.',
    ' this is because functions passed to fn get executed automatically.',
  ]),

  Pre(`
import { is } from '@magic/test'

const fnToTest = () => {}

// both the tests will work as expected
export default [
  {
    fn: () => fnToTest,
    expect: is.function,
    info: 'function is a function',
  },
  {
    fn: is.fn(fnToTest), // returns true
    // we do not set expect: true, since that is the default
    // expect: true,
    info: 'function is a function',
  },
]
`),

  Pre(`
// will not work as expected and instead call fnToTest
export default {
  fn: fnToTest,
  expect: is.function,
  info: 'function is a function',
}
`),

  h3({ id: 'tests-multiple' }, 'multiple tests'),

  p('multiple tests can be created by exporting an array of single test objects.'),

  Pre(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}`),

  p('multiple tests can also be created by exporting an array of tests.'),

  Pre(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]
`),

  h3({ id: 'tests-promises' }, 'promises'),

  Pre(`
import { promise, is } from '@magic/test'

export default [
  // kinda clumsy, but works. until you try handling errors.
  {
    fn: new Promise(cb => setTimeOut(() => cb(true), 2000)),
    expect: true,
    info: 'handle promises',
  },
  // better!
  {
    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),
    expect: true,
    info: 'handle promises in a nicer way',
  },
  {
    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),

  h3({ id: 'tests-cb' }, 'callback functions'),
  Pre(`
import { promise, is } from '@magic/test'

const fnWithCallback = (err, arg, cb) => cb(err, arg)

export default [
  {
    fn: promise(cb => fnWithCallback(null, true, cb)),
    expect: true
    info: 'handle callback functions as promises',
  },
  {
    fn: promise(cb => fnWithCallback(new Error('oops'), true, cb)),
    expect: is.error,
    info: 'handle callback function error as promise',
  },
]
`),

  h3({ id: 'tests-hooks' }, 'hooks'),

  p('run functions before and/or after individual test'),

  Pre(`
const after = () => {
  global.testing = 'Test has finished, cleanup.'
}

const before = () => {
  global.testing = false

  // if a function gets returned,
  // this function will be executed once the test finished.
  return after
}

export default [
  {
    fn: () => { global.testing = 'changed in test' },
    // if before returns a function, it will execute after the test.
    before,
    after,
    expect: () => global.testing === 'changed in test',
  },
]
`),

  h3({ id: 'tests-suite-hooks' }, 'suite hooks'),

  p('run functions before and/or after a suite of tests'),

  Pre(`
const afterAll = () => {
  // Test has finished, cleanup.'
  global.testing = undefined
}

const beforeAll = () => {
  global.testing = false

  // if a function gets returned,
  // this function will be executed once the test suite finished.
  return afterAll
}

export default [
  {
    fn: () => { global.testing = 'changed in test' },
    // if beforeAll returns a function, it will execute after the test suite.
    beforeAll,
    // this is optional and can be omitted if beforeall returns a function.
    // in this example, afterAll will trigger twice.
    afterAll,
    expect: () => global.testing === 'changed in test',
  },
]
`),

  h3({ id: 'tests-magic-modules' }, 'magic modules'),

  p([
    '@magic-modules assume all html tags to be globally defined.',
    ' to create those globals for your test and check if a @magic-module returns the correct markup,',
    ' just add an html: true flag to the test.',
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
  // note that fn is a wrapped function, we can not call i directly as we could other functions
  {
    fn: () => i(props, 'testing'),
    expect,
    info: 'magic/test can now test html',
  },
]
`),

  h2({ id: 'lib' }, 'Utility Belt'),
  p([
    '@magic/test exports some utility functions',
    ' that make working with complex test workflows simpler.',
  ]),

  h4({ id: 'lib-curry' }, 'curry'),

  p([
    'Currying can be used to split the arguments of a function into multiple nested functions.',
    ' This helps if you have a function with complicated arguments that you just want to quickly shim.',
  ]),
  Pre(`
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),

  h4({ id: 'lib-vals' }, 'vals'),

  p([
    'exports some javascript types. more to come.',
    ' will sometime in the future be the base of a fuzzer.',
  ]),

  h3({ id: 'lib-promises' }, 'promises'),

  p([
    'Helper function to wrap nodejs callback functions and promises with ease.',
    ' Handle the try/catch steps internally and return a resolved or rejected promise.',
  ]),
  Pre(`
import { promise, is } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),
    expect: true,
    info: 'handle promises in a nice way',
  },
  {
    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),

  h3({ id: 'lib-css' }, 'css'),

  p([
    'exports ',
    Link({ to: 'https://github.com/magic/css', text: '@magic/css' }),
    ', which allows parsing and stringification of css-in-js objects.',
  ]),

  h4({ id: 'lib-trycatch' }, 'trycatch'),

  p('allows to test functions without bubbling the errors up into the runtime'),

  Pre(`
import { is, tryCatch } from '@magic/test'

const throwing = () => throw new Error('oops')
const healthy = () => true

export default [
  {
    fn: tryCatch(throwing()),
    expect: is.error,
    info: 'function throws an error',
  },
  {
    fn: tryCatch(healthy()),
    expect: true,
    info: 'function does not throw'
  },
]
`),

  h4({ id: 'lib-version' }, 'version'),
  p(
    'The version plugin checks your code according to a spec defined by you. This is designed to warn you on changes to your exports.',
  ),

  p([
    'Internally, the version function calls ',
    Link({ to: 'https://github.com/magic/types', text: '@magic/types' }),
    ' and all functions exported from it are valid type strings in version specs.',
  ]),

  Pre(`
// test/spec.js
import { version } from '@magic/test'

// import your lib as your codebase requires
// import * as lib from '../src/index.js'
// import lib from '../src/index.js

const spec = {
  stringValue: 'string',
  numberValue: 'number',

  objectValue: [
    'obj',
    {
      key: 'Willbechecked',
    },
  ],

  objectNoChildCheck: [
    'obj',
    false,
  ],
}

export default version(lib, spec)
  `),

  h2({ id: 'usage' }, 'usage'),

  h3({ id: 'usage-js' }, 'js'),

  Pre(`
// test/index.mjs
import run from '@magic/test'

const tests = {
  lib: [
    { fn: () => true, expect: true, info: 'Expect true to be true' }
  ],
}

run(tests)
`),

  h2({ id: 'usage-cli' }, 'cli'),
  h3({ id: 'packagejson-recommended' }, 'package.json (recommended)'),

  p('add the magic/test bin scripts to package.json'),

  Pre(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}`),

  p('then use the npm run scripts'),

  Pre(`
npm test
npm run coverage
`),

  h3({ id: 'usage-global' }, 'Globally (not recommended):'),

  p([
    'you can install this library globally,',
    ' but the recommendation is to add the dependency and scripts to the package.json file.',
  ]),

  p([
    'this both explains to everyone that your app has these dependencies',
    ' as well as keeping your bash free of clutter',
  ]),

  Pre(`
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
`),

  p([
    'This library tests itself, have a look at ',
    Link({ to: 'https://github.com/magic/test/tree/master/test', text: 'the tests' }),
    ' Checkout ',
    Link({ to: 'https://github.com/magic/types/tree/master/test', text: '@magic/types' }),
    ' and the other magic libraries for more test examples.',
  ]),
]
