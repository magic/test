export const View = state => [
  h1(state.title),

  state.description.map(d => p(d)),

  GitBadges('magic/test'),

  h2({ id: 'getting-started' }, 'getting started'),
  p('be in a nodejs project.'),

  h3({ id: 'getting-started-install' }, 'install'),
  Pre('npm i --save-dev @magic/test'),

  Pre(`
// create test/functionName.mjs
import yourTest from '../path/to/your/file.mjs'

export default [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the yourTest function will be called automagically
  { fn: yourTest, expect: true, info: 'hope this will work ;)'}
]`),

  h3({ id: 'getting-started-npm-scripts' }, 'npm run scripts'),
  p('edit package.json'),
  Pre(`
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
    "format": "f -w", // format using prettier and write changes to files
    "format:check": "f" // check format using prettier
  }
}`),
  p('repeated for easy copy pasting (without comments)'),
  Pre(`
  "scripts": {
    "test": "t -p",
    "coverage": "t",
    "format": "f -w",
    "format:check": "f"
  }`),

  h3({ id: 'getting-started-quick-tests' }, 'quick tests (without coverage)'),
  Pre(`
// run the tests:
npm test

// example output:
// (failing tests will print, passing tests are silent)

// ### Testing package: @magic/test
// Ran 2 tests. Passed 2/2 100%`),

  h3({ id: 'getting-started-coverage' }, 'coverage'),
  p([
    '@magic/test will automagically generate coverage reports if it is not called with the -p flag.',
  ]),

  h3({ id: 'test-suites' }, 'data/fs driven test suite creation:'),
  h4('expectations for optimal test messages:'),
  p('src and test directories have the same structure and files'),
  p('tests one src file per test file'),
  p('tests one function per suite'),
  p('tests one feature per test'),

  h4({ id: 'test-suites-fs' }, 'Filesystem based naming'),
  p('the following directory structure:'),
  Pre(`
./test/
  ./suite1.mjs
  ./suite2.mjs`),

  p('yields the same result as exporting the following from ./test/index.mjs'),

  h4({ id: 'test-suites-data' }, 'Data driven naming'),
  Pre(`
import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}`),

  h3('Important - File mappings'),
  p('if test/index.mjs exists, no other files will be loaded.'),
  p('if test/lib/index.mjs exists, no other files from that subdirectory will be loaded.'),

  h3({ id: 'tests' }, 'single test, literal value, function or promise'),

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

export default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }`),

  h4({ id: 'tests-types' }, 'testing types'),
  p([
    'types can be compared using ',
    Link({ to: 'https://github.com/magic/types' }, '@magic/types'),
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
]`),

  h4('caveat:'),
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
    info: 'function is a function',
  },
]`),

  Pre(`
// will not work as expected and instead call fnToTest
export default {
  fn: fnToTest,
  expect: is.function,
  info: 'function is a function',
}`),

  h3({ id: 'tests-multiple' }, ' multiple tests'),
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
  ]`),

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
]`),

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
]`),

  h3({ id: 'tests-hooks' }, 'run functions before and/or after individual test'),
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
]`),

  h3({ id: 'tests-suite-hooks' }, 'run functions before and/or after a suite of tests'),
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
]`),

  h2({ id: 'lib' }, 'Utility Belt'),
  p(
    '@magic/test exports some utility functions that make working with complex test workflows simpler.',
  ),

  h4({ id: 'lib-curry' }, 'curry'),
  p('Currying can be used to split the arguments of a function into multiple nested functions.'),
  p([
    'This helps if you have a function with complicated arguments',
    ' that you just want to quickly shim.',
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
  p('Helper function to wrap nodejs callback functions and promises with ease.'),
  p('Handles the try/catch steps internally and returns a resolved or rejected promise.'),

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
]`),

  h3({ id: 'lib-css' }, 'css'),
  p([
    'exports ',
    Link({ to: 'https://github.com/magic/css' }, '@magic/css'),
    ' which allows parsing and stringification of css-in-js objects.',
  ]),

  h4({ id: 'lib-trycatch' }, 'tryCatch'),
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
]`),

  h2({ id: 'usage' }, 'Usage'),

  h3({ id: 'usage-js' }, 'mjs api:'),

  Pre(`
// test/index.mjs
import run from '@magic/test'

const tests = {
  lib: [
    { fn: () => true, expect: true, info: 'Expect true to be true' }
  ],
}

run(tests)`),

  h2({ id: 'usage-cli' }, 'cli'),

  h3('package.json (recommended)'),
  p('Add the magic/test bin scripts to package.json'),

  Pre(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
    "format": "f -w",
    "format:check": "f"
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}`),

  p('then use the npm run scripts'),
  Pre(`
npm test
npm run coverage
npm run format
npm run format:check`),

  h3({ id: 'usage-global' }, 'Globally (not recommended):'),
  p([
    'you can install this library globally',
    ' but the recommendation is to add the dependency and scripts to the package.json file.',
  ]),

  p([
    'this both explains to everyone that your app has these dependencies',
    ' as well as keeping your bash free of clutter',
  ]),

  Pre(`
npm i -g magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t

// check formatting using prettier but do not write
// prettier --list-different
f

// format files using prettier
// prettier --write
f -w`),

  p([
    'This library tests itself, have a look at ',
    Link({ to: 'https://github.com/magic/test/tree/master/test' }, 'the tests'),
  ]),

  p(
    'Checkout [@magic/types](https://github.com/magic/types) and the other magic libraries for more test examples.',
  ),

  h2({ id: 'changelog' }, 'changelog'),

  h3('0.1.0'),
  p('use esmodules instead of commonjs.'),

  h3('0.1.1'),
  p('rework of bin scripts and update dependencies to esmodules'),

  h3('0.1.2'),
  p('cli now works on windows again (actually, this version is broken on all platforms.)'),

  h3('0.1.3'),
  p('cli now works everywhere'),

  h3('0.1.4'),
  p('npm run scripts of @magic/test itself can be run on windows.'),

  h3('0.1.5'),
  p('use ecmascript version of @magic/deep'),

  h3('0.1.6'),
  p('update this readme and html docs.'),
  p('tests should always process.exit(1) if they errored.'),

  h3('0.1.7'),
  p('readded calls npm run script'),
  p('updated c8'),

  h3('0.1.8'),
  p('update @magic/cli'),

  h3('0.1.9'),
  p('test/beforeAll.mjs gets loaded separately if it exists and executed before all tests'),
  p('test/afterAll.mjs gets loaded separately if it exists and executed after all tests'),
  p([
    'if the function exported from test/beforeAll.mjs returns another function,',
    ' this function will be executed after all tests,',
    ' additionally to any functions exported from test/afterAll.mjs.',
  ]),
  p('export hyperapp beta.18'),

  h3('0.1.10'),
  p('node 12.4.0 does not use --experimental-json-modules flag. removed it in 12.4+.'),

  h3('0.1.11'),
  p('update prettier, coveralls'),
  p('add @magic/css and export it for css testing'),

  h3('0.1.12'),
  p('update dependencies'),

  h3('0.1.13'),
  p('tests now work on windows (again)'),

  h3('0.1.14'),
  p('tests on windows now support index.mjs files'),

  h3('0.1.15'),
  p('update dependencies'),

  h3('0.1.16'),
  p('update @magic/cli for node 13 support.'),

  h3('0.1.17'),
  p('make coverage work in node 13'),

  h3('0.1.18'),
  p('update dependencies'),
  p('bump required node version to 12.13.0'),

  h3('0.1.19'),
  p('update dependencies'),

  h3('0.1.20'),
  p('update broken depdencies'),

  h3('0.1.21'),
  p('update @magic/cli to allow default args'),

  h3('0.1.22'),
  p('update dependencies'),

  h3('0.1.23'),
  p('use @magic npm packages instead of github'),

  LightSwitch(state),
]
