module.exports = () => [
  h1('@magic/test'),
  p('simple tests with lots of utility.'),

  GitBadges({
    project: 'magic/test',
    appveyor: 'jaeh/test',
  }),

  h2('dependencies'),
  p([ Link({ to: 'https://github.com/magic/log'}, '@magic/log'), ': console.log wrapper with loglevels' ]),
  p([ Link({ to: 'https://github.com/magic/types' }, '@magic/types'), ': type checking library']),
  p([ Link({ to: 'https://www.npmjs.com/package/nyc' }, 'nyc'), ': code coverage']),
  p([ Link({ to: 'https://www.npmjs.com/package/prettier' }, 'prettier'), ': code formatting']),

  p('@magic/log and @magic/types have no dependencies.'),

  h2({ id: 'install' }, 'Getting started'),
  p('be in a nodejs project.'),
  Pre.View('npm i --save-dev @magic/test'),

Pre.View(`
// create test/functionName.js
const yourTest = require('../path/to/your/file.js')

module.exports = [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the function will be called automagically
  { fn: yourTest, expect: true, info: 'hope this will work ;)'}
]`),

  h3({ id: "npm-scripts" }, 'npm run scripts'),
  p('edit package.json'),
  Pre.View(`
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
    "format": "f -w", // format using prettier and write changes to files
    "format:check": "f" // check format using prettier
  }
}`),
// repeated for easy copy pasting (without comments):
  Pre.View(`
  "scripts": {
    "test": "t -p",
    "coverage": "t",
    "format": "f -w",
    "format:check": "f"
  }`),

  h3('quick tests (without coverage)'),
  Pre.View(`
// run the tests:
npm test

// example output:
// (failing tests will print, passing tests are silent)

// ### Testing package: @magic/test
// Ran 2 tests. Passed 2/2 100%`),

  h3('coverage'),
  p('run coverage reports and get full test report including from passing tests'),
  Pre.View('npm run coverage'),

  h3({ id: 'test-suites' }, 'data/fs driven test suite creation:'),
  h4('expectations for optimal test messages:'),
  p('src and test directories have the same structure and files'),
  p('tests one src file per test file'),
  p('tests one function per suite'),
  p('tests one feature per test'),


  h4('Filesystem based naming'),
  p('the following directory structure:'),
  Pre.View(`
./test/
  ./suite1.js
  ./suite2.js`),

  p('yields the same result as exporting the following from ./test/index.js'),

  h4('Data driven naming'),
  Pre.View(`
const suite1 = require('./suite1')
const suite2 = require('./suite2')

module.exports = {
  suite1,
  suite2,
}`),

  h3('Important - File mappings'),
  p('if test/index.js exists, no other files will be loaded.'),
  p('if test/lib/index.js exists, no other files from that subdirectory will be loaded.'),

  h3({ id: 'tests' }, 'single test, literal value, function or promise'),

  Pre.View(`
module.exports = { fn: true, expect: true, info: 'expect true to be true' }

// expect: true is the default and can be omitted
module.exports = { fn: true, info: 'expect true to be true' }

// if fn is a function expect is the returned value of the function
module.exports = { fn: () => false, expect: false, info: 'expect true to be true' }

// if expect is a function the return value of the test get passed to it
module.exports = { fn: false, expect: t => t === false, info: 'expect true to be true' }

// if fn is a promise the resolved value will be returned
module.exports = { fn: new Promise(r => r(true)), expect: true, info: 'expect true to be true' }

// if expects is a promise it will resolve before being compared to the fn return value
module.exports = { fn: true, expect: new Promise(r => r(true)), info: 'expect true to be true' }

// callback functions can be tested easily too:
const { promise } = require('@magic/test')
const fnWithCallback = (err, arg, cb) => cb(err, arg)
module.exports = { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }`),

  h4({ id: 'tests-types' }, 'testing types'),
  p(['types can be compared using ', Link({ to: 'https://github.com/magic/types' }, '@magic/types')]),
  p([
    '@magic/types is a richly featured and thoroughly tested type library without dependencies.',
    ' it is exported from this library for convenience.'
  ]),

  Pre.View(`
const { is } = require('@magic/test')
module.exports = [
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
  p('if you want to test if a function is a function, you need to wrap the function'),

  Pre.View(`
const { is } = require('@magic/test')

const fnToTest = () => {}
module.exports = {
  // will work as expected
  fn: () => fnToTest,
  expect: is.function,
  info: 'function is a function',
}`),

Pre.View(`
// will not work as expected and instead call fnToTest
module.exports = {
  fn: fnToTest,
  expect: is.function,
  info: 'function is a function',
}`),

  h3({ id: 'tests-multiple' }, ' multiple tests'),
  p('multiple tests can be created by exporting an array of single test objects.'),

  Pre.View(`
module.exports = {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}`),

h3({ id: 'tests-promises' }, 'promises'),
  Pre.View(`
const { promise, is } = require('@magic/test')

module.exports = [
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
  Pre.View(`
const { promise, is } = require('@magic/test')

const fnWithCallback = (err, arg, cb) => cb(err, arg)

module.exports = [
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
  Pre.View(`
const after = () => {
  global.testing = 'Test has finished, cleanup.'
}

const before = () => {
  global.testing = false

  // if a function gets returned,
  // this function will be executed once the test finished.
  return after
}

module.exports = [
  {
    fn: () => { global.testing = 'changed in test' },
    // if before returns a function, it will execute after the test.
    before,
    after,
    expect: () => global.testing === 'changed in test',
  },
]`),

h3({ id: 'tests-suite-hooks' }, 'run functions before and/or after a suite of tests'),
  Pre.View(`
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

module.exports = [
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
p('@magic/test exports some utility functions that make working with complex test workflows simpler.'),

h4({ id: "lib-curry" }, 'curry'),
p('Currying can be used to split the arguments of a function into multiple nested functions.'),
p('This helps if you have a function with complicated arguments that you just want to quickly shim.'),

  Pre.View(`
const { curry } = require('@magic/test')
const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

module.exports = {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),

h4({ id: 'lib-vals' }, 'vals'),
p('exports some javascript types. more to come. will sometime in the future be the base of a fuzzer.'),

h3({ id: 'lib-promises' }, 'promises'),
p('Helper function to wrap nodejs callback functions and promises with ease.'),
p('Handles the try/catch steps internally and returns a resolved or rejected promise.'),

  Pre.View(`
const { promise, is } = require('@magic/test')

module.exports = [
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

  h4({ id: 'lib-trycatch' }, 'tryCatch'),
  p('allows to test functions without bubbling the errors up into the runtime'),
  Pre.View(`
const { is, tryCatch } = require('@magic/test')
const throwing = () => throw new Error('oops')
const healthy = () => true

module.exports = [
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

  h2({ id: 'usage-js' }, 'js api:'),

  Pre.View(`
// test/index.js
const run = require('@magic/test')

const tests = {
  lib: [
    { fn: () => true, expect: true, info: 'Expect true to be true' }
  ],
}

run(tests)`),

  h2({ id: 'usage-cli' }, 'cli'),

  h3('package.json (recommended)'),
  p('Add the magic/test bin scripts to package.json'),

  Pre.View(`
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
  Pre.View(`
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
    'this both explains to everyone that your app has this dependencies',
    ' and keeps your bash free of clutter'
  ]),

  Pre.View(`
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

  p('Checkout [@magic/types](https://github.com/magic/types) and the other magic libraries for more test examples.'),

]