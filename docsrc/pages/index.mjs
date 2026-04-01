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
// create test/functionName.js
import yourTest from '../path/to/your/file.js'

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
  ./suite1.js
  ./suite2.js`),
  p('yields the same result as exporting the following from ./test/index.js'),

  h4({ id: 'test-suites-data' }, 'Data driven naming'),

  Pre(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}`),

  h3({ id: 'important---file-mappings' }, 'Important - File mappings'),

  p([
    'if test/index.js exists, no other files will be loaded.',
    ' if test/index.js exists, no other files from that directory will be loaded,',
    ' if test/lib/index.js, no other files from that subdirectory will be loaded.',
    ' instead the exports of those index.js will be expected to be tests',
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

  h4({ id: 'tests-typescript' }, 'TypeScript support'),

  p([
    '@magic/test supports TypeScript test files.',
    ' You can write tests in .ts files and they will be executed directly without transpilation.',
  ]),

  Pre(`
// test/mytest.ts
export default { fn: () => true, expect: true, info: 'TypeScript test works!' }
`),

  p('This requires Node.js 14.2.0 or later.'),

  h3({ id: 'tests-multiple' }, 'multiple tests'),

  p('multiple tests can be created by exporting an array or object of single test objects.'),

  Pre(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]`),

  p('or exporting an object with named test arrays'),

  Pre(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}`),

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

  h3({ id: 'tests-runs' }, 'running tests multiple times'),

  p('Use the runs property to run a test multiple times:'),

  Pre(`
let counter = 0
const increment = () => counter++

export default [
  {
    fn: increment,
    expect: 1,
    runs: 5,
    info: 'runs the test 5 times and expects final value to be 5',
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

   p('File-based Hooks:'),

   p([
     'You can also create test/beforeAll.js and test/afterAll.js files',
     ' that run before/after all tests in a suite.',
   ]),

   p('**Note:** These files must be placed at the **root** `test/` directory (not in subdirectories).'),

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

  h3({ id: 'tests-each-hooks' }, 'beforeEach and afterEach hooks'),

  p('Define beforeEach and afterEach hooks in your test objects that run before/after each individual test:'),

  Pre(`
const beforeEach = () => {
  // Runs before each test in this suite
  global.testState = { initialized: true }
}

const afterEach = (testResult) => {
  // Runs after each test, receives the test result
  console.log('Test completed:', testResult?.pass)
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

  h3({ id: 'tests-magic-modules' }, 'magic modules'),

  p([
    '@magic-modules assume all html tags to be globally defined.',
    ' to create those globals for your test and check if a @magic-module returns the correct markup,',
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
    'Exports JavaScript type constants for testing against any value.',
    ' Useful for fuzzing and property-based testing.',
  ]),

  Pre(`
import { vals, is } from '@magic/test'

export default [
  { fn: () => 'test', expect: is.string, info: 'test if value is a string' },
  { fn: () => vals.true, expect: true, info: 'boolean true value' },
  { fn: () => vals.email, expect: is.email, info: 'valid email format' },
  { fn: () => vals.error, expect: is.error, info: 'error instance' },
]
`),

  p('Available Constants:'),

  ul([
    li('Primitives: true, false, number, num, float, int, string, str'),
    li('Empty values: nil, emptystr, emptyobject, emptyarray, undef'),
    li('Collections: array, object, obj'),
    li('Time: date, time'),
    li('Errors: error, err'),
    li('Colors: rgb, rgba, hex3, hex6, hexa4, hexa8'),
    li('Other: func, truthy, falsy, email, regexp'),
  ]),

  h4({ id: 'lib-env' }, 'env'),

  p('Environment detection utilities for conditional test behavior.'),

  p('Available utilities:'),

  ul([
    li('isNodeProd - checks if NODE_ENV is set to production'),
    li('isProd - checks if -p flag is passed to the CLI'),
    li('isVerbose - checks if -l flag is passed to the CLI'),
  ]),

  Pre(`
import { env } from '@magic/test'

export default [
  {
    fn: env.isNodeProd,
    expect: process.env.NODE_ENV === 'production',
    info: 'checks if NODE_ENV is production',
  },
  {
    fn: env.isProd,
    expect: process.argv.includes('-p'),
    info: 'checks if -p flag is passed',
  },
  {
    fn: env.isVerbose,
    expect: process.argv.includes('-l'),
    info: 'checks if -l flag is passed',
  },
]
`),

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
    fn: promise(cb => setTimeOut(() => cb(new Error('error'), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),

  h4({ id: 'lib-stringify' }, 'stringify'),

  p('Converts values to strings for comparison testing.'),

  Pre(`
import { stringify } from '@magic/test'

export default [
  {
    fn: () => stringify({ a: 1, b: 2 }),
    expect: '{"a":1,"b":2}',
    info: 'stringifies object to JSON',
  },
]
`),

  h4({ id: 'lib-handleResponse' }, 'handleResponse'),

  p('Processes HTTP responses, automatically handling JSON parsing and error detection.'),

  Pre(`
import { handleResponse } from '@magic/test'

export default [
  {
    fn: async () => {
      const response = { ok: true, json: () => Promise.resolve({ data: 'test' }) }
      return handleResponse(response)
    },
    expect: { data: 'test' },
    info: 'handles JSON response',
  },
]
`),

  h4({ id: 'lib-http' }, 'http'),

  p('HTTP utility for making requests in tests. Supports both HTTP and HTTPS.'),

  Pre(`
import { http } from '@magic/test'

export default [
  {
    fn: http.get('https://api.example.com/data'),
    expect: { success: true },
    info: 'fetches data from API',
  },
  {
    fn: http.post('https://api.example.com/users', { name: 'John' }),
    expect: { id: 1, name: 'John' },
    info: 'creates a new user',
  },
  {
    fn: http.post('http://localhost:3000/data', 'raw string'),
    expect: 'raw string',
    info: 'posts raw string data',
  },
]
`),

  p('Error Handling:'),

  Pre(`
import { http, is } from '@magic/test'

export default [
  {
    fn: http.get('https://invalid-domain-that-does-not-exist.com'),
    expect: is.error,
    info: 'rejects on network error',
  },
  {
    fn: http.get('https://api.example.com/nonexistent'),
    expect: res => res.status === 404,
    info: 'handles 404 responses',
  },
]
`),

  p('Note: HTTP module automatically handles protocol detection, JSON parsing, and rejectUnauthorized: false'),

  h4({ id: 'lib-css' }, 'css'),

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
  ]
`),

  h4({ id: 'lib-error' }, 'error'),

  p([
    'exports ',
    Link({ to: 'https://github.com/magic/error', text: '@magic/error' }),
    ' which returns errors with optional names.',
  ]),

  Pre(`
import { error } from '@magic/test'

export default [
  {
    fn: tryCatch(error('Message', 'E_NAME')),
    expect: e => e.name === 'E_NAME' && e.message === 'Message',
    info: 'Errors have messages and (optional) names.',
  },
]
`),

  h4({ id: 'lib-mock' }, 'mock'),

  p('Mock and spy utilities for function testing.'),

  Pre(`
import { mock, tryCatch } from '@magic/test'

export default [
  {
    fn: () => {
      const spy = mock.fn()
      spy('arg1')
      return spy.calls.length === 1 && spy.calls[0][0] === 'arg1'
    },
    expect: true,
    info: 'mock.fn tracks call arguments',
  },
  {
    fn: () => {
      const spy = mock.fn().mockReturnValue('mocked')
      return spy() === 'mocked'
    },
    expect: true,
    info: 'mock.fn.mockReturnValue sets return value',
  },
  {
    fn: async () => {
      const spy = mock.fn().mockThrow(new Error('fail'))
      const caught = await tryCatch(spy)()
      return caught instanceof Error
    },
    expect: true,
    info: 'mock.fn.mockThrow works with tryCatch',
  },
  {
    fn: () => {
      const obj = { greet: () => 'hello' }
      const spy = mock.spy(obj, 'greet', () => 'world')
      const result = obj.greet()
      spy.mockRestore()
      return result === 'world' && obj.greet() === 'hello'
    },
    expect: true,
    info: 'mock.spy replaces and restores methods',
  },
]
`),

  p('mock.fn properties:'),
  ul([
    li('calls - Array of all call arguments'),
    li('returns - Array of all return values'),
    li('errors - Array of all thrown errors (null for non-throwing calls)'),
    li('callCount - Number of times called'),
  ]),

  p('mock.fn methods:'),
  ul([
    li('mockReturnValue(value) - Set return value (chainable)'),
    li('mockThrow(error) - Set error to throw (chainable)'),
    li('getCalls() - Get all call arguments'),
    li('getReturns() - Get all return values'),
    li('getErrors() - Get all thrown errors'),
  ]),

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

  p('The spec supports testing parent objects without checking their child properties by using `false` as the second element:'),

  h4({ id: 'lib-svelte' }, 'svelte'),

  p([
    '@magic/test includes built-in support for testing Svelte 5 components.',
    ' It compiles Svelte components, mounts them in a DOM environment,',
    ' and provides utilities for interacting with and asserting on component behavior.',
  ]),

  Pre(`
import { mount, html, tryCatch } from '@magic/test'

const component = './path/to/MyComponent.svelte'

export default [
  {
    component,
    props: { message: 'Hello' },
    fn: ({ target }) => html(target).includes('Hello'),
    expect: true,
    info: 'renders the message prop',
  },
]
`),

  p('Exported Functions:'),

  ul([
    li('mount(filePath, options) - Mounts a Svelte component'),
    li('html(target) - Returns innerHTML'),
    li('text(target) - Returns textContent'),
    li('component(instance) - Returns component instance'),
    li('props(target) - Returns attribute name/value pairs'),
    li('click(target, selector) - Clicks an element'),
    li('trigger(target, eventType, options) - Dispatches custom event'),
    li('scroll(target, x, y) - Scrolls element to x/y'),
  ]),

  p('Test Properties:'),

  ul([
    li('component - Path to the .svelte file'),
    li('props - Props to pass to the component'),
    li('fn - Test function receiving { target, component, unmount }'),
  ]),

  p('Example: Accessing Component State'),

  Pre(`
import { mount, html } from '@magic/test'

const component = './src/lib/svelte/components/Counter.svelte'

export default [
  {
    component,
    fn: async ({ target, component: instance }) => {
      return instance.count
    },
    expect: 0,
    info: 'initial count is 0',
  },
]
`),

  p('Automatic Test Exports'),

   p([
     'When testing Svelte 5 components, @magic/test automatically exports ',
     '$state and $derived variables, making them accessible in tests without requiring manual exports.',
   ]),

   p('**Note:** This automatic export feature is specific to **Svelte 5** only. Svelte 4 components do not have this capability.'),

  Pre(`
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
  <!-- No export needed! -->
</script>

<button class="inc">+</button>
<span>{doubled}</span>
`),

  p('Test - works automatically!'),

  Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,  // 0
    expect: 0,
    info: 'access $state without manual export',
  },
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.doubled,  // 0 (derived)
    expect: 0,
    info: 'access $derived without manual export',
  },
]
`),

  p('This works automatically for all $state and $derived runes. No configuration needed!'),

  p('Example: Testing Error Handling'),

  Pre(`
import { mount, tryCatch } from '@magic/test'

const component = './src/lib/svelte/components/MyComponent.svelte'

export default [
  {
    fn: tryCatch(mount, component, { props: null }),
    expect: t => t.message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
]
`),

  h2({ id: 'native-runner' }, 'Native Node.js Test Runner'),

  p([
    '@magic/test includes a native Node.js test runner that uses the built-in --test flag.',
    ' This provides better integration with Node.js ecosystem tools and IDEs.',
  ]),

  h3({ id: 'native-usage' }, 'Usage'),

  Pre(`
# Run tests using Node.js native test runner
npm run test:native
`),

  p('Add to your package.json:'),

  Pre(`
{
  "scripts": {
    "test": "t -p",
    "test:native": "node --test src/bin/node-test-runner.js"
  }
}
`),

  h3({ id: 'native-external' }, 'Using in External Libraries'),

  p('To use the native test runner in your own library that depends on @magic/test:'),

  p('1. Copy the runner file to your project:'),

  Pre(`
# Copy node-test-runner.js to your project
cp node_modules/@magic/test/src/bin/node-test-runner.js src/
`),

  p('2. Update the paths in the runner if needed (it uses relative paths to find the test directory)'),

  p('3. Add the script to your package.json:'),

  Pre(`
{
  "scripts": {
    "test": "t -p",
    "test:native": "node --test src/bin/node-test-runner.js"
  }
}
`),

  h3({ id: 'native-features' }, 'Features'),

  p('The native runner supports all the same features as the custom runner:'),

  ul([
    li('Test file discovery (.js, .mjs, .ts)'),
    li('File-based hooks (beforeAll.js, afterAll.js)'),
    li('Svelte component testing'),
    li('All assertion types'),
    li('Global magic modules'),
  ]),

  h3({ id: 'native-differences' }, 'Differences from Custom Runner'),

  p('| Feature | Custom Runner | Native Runner |'),
  p('|---------|--------------|---------------|'),
  p('| Test discovery | Custom glob patterns | Node.js --test patterns |'),
  p('| Output format | Colored CLI output | Node.js test format |'),
  p('| Hooks | Full support | Full support |'),
  p('| Coverage | Via c8 | Not available |'),

  h3({ id: 'test-isolation' }, 'Test Isolation'),

  p([
    '@magic/test supports test isolation to prevent tests from affecting each other.',
    ' Tests in the same suite can share state, but you can isolate them:',
  ]),

  Pre(`
export default [
  // This test runs in isolation from others
  {
    fn: () => {
      const state = { counter: 0 }
      state.counter++
      return state.counter
    },
    expect: 1,
    info: 'isolated test with local state',
  },
]
`),

  p('Global Isolation Mode:'),

  p('By default, tests in the same file share global state. To enable strict isolation where each test gets a fresh environment:'),

  Pre(`
// This runs each test in isolation with fresh globals
export const __isolate = true

export default [
  { fn: () => global.test = 1, expect: 1 },
  { fn: () => global.test === undefined, expect: true, info: 'fresh global state' },
]
   `),

   p('Programmatic Detection:'),

   p('You can programmatically check if a suite requires isolation using the `suiteNeedsIsolation` utility:'),

   Pre(`
import { suiteNeedsIsolation } from '@magic/test'

const needsIsolation = suiteNeedsIsolation(tests)
`),

   p('This is useful for custom runners or when building test tooling.'),

   h2({ id: 'usage' }, 'usage'),

  h3({ id: 'usage-js' }, 'js'),

   Pre(`
// test/index.js
import { run } from '@magic/test'

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

  h4({ id: 'cli-flags' }, 'CLI Flags'),

  p('Available command-line flags:'),

   ul([
     li('-p, --production, --prod - Run tests without coverage (faster)'),
     li('-l, --verbose, --loud - Show detailed output including passing tests'),
     li('-i, --include - Files to include in coverage'),
     li('-e, --exclude - Files to exclude from coverage'),
     li('--shards, --shard-count - Total number of shards to split tests across'),
      li('--shard-id - Shard ID (0-indexed) to run'),
      li('--help - Show help text'),
    ]),

   p('Note: `--shards` and `--shard-id` must be used together. `--shard-id` is 0-indexed (0 to N-1).'),

   p('Common Usage:'),

   Pre(`
# Quick test run (no coverage, fails show errors)
npm test        # or: t -p

# Full test with coverage report
npm run coverage  # or: t

# Verbose output (shows passing tests)
t -l

# Test with coverage for specific files
t -i "src/**/*.js"

# Use glob patterns for include/exclude
t -i "src/**/*.js" -e "**/*.spec.js"

# Run tests with sharding (for parallel CI)
t --shards 4 --shard-id 0
    `),

   h3({ id: 'sharding' }, 'Sharding Tests'),

   p([
     'Run tests in parallel across multiple processes to speed up large test suites.',
   ]),

   Pre(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2
`),

   p([
     'Tests are distributed deterministically using a hash of the test file path,',
     ' ensuring each test always runs in the same shard.',
   ]),

   p('Add to your package.json for CI/CD:'),

   Pre(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),

   p('Or use a single command to run all shards in parallel:'),

   Pre(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),

   p([
     'This library tests itself, have a look at ',
     Link({ to: 'https://github.com/magic/test/tree/master/test', text: 'the tests' }),
     ' Checkout ',
    Link({ to: 'https://github.com/magic/types/tree/master/test', text: '@magic/types' }),
    ' and the other magic libraries for more test examples.',
  ]),

  h3({ id: 'exit-codes' }, 'Exit Codes'),

  p('@magic/test returns specific exit codes to indicate test results:'),

  p('| Exit Code | Meaning |'),
  p('| --------- | ------- |'),
  p('| 0 | All tests passed |'),
  p('| 1 | One or more tests failed |'),

  Pre(`
# Run tests and check exit code
npm test
echo "Exit code: $?"  # 0 = success, 1 = failure
`),

  h3({ id: 'performance-tips' }, 'Performance Tips'),

  p('Follow these tips to get the most out of @magic/test:'),

  p('Use the -p flag for development:'),

  Pre(`
# Fast mode - no coverage, only shows failures
npm test
# or
t -p
`),

  p('Run tests in parallel with native runner:'),

  Pre(`
# Native runner uses Node.js built-in test runner
npm run test:native
`),

  p('Minimize async overhead:'),

  Pre(`
# Slower: unnecessary async
export default {
  fn: async () => {
    return true
  },
  expect: true,
}

# Faster: sync test
export default {
  fn: () => true,
  expect: true,
}
`),

  p('Use local state instead of globals:'),

  Pre(`
# Slower: global state requires isolation
export const __isolate = true

# Faster: local state is naturally isolated
export default [
  {
    fn: () => {
      const counter = 0
      return ++counter
    },
    expect: 1,
  },
]
`),

  p('Batch related tests:'),

  Pre(`
# Faster: single suite with multiple tests
export default [
  { fn: () => add(1, 2), expect: 3 },
  { fn: () => add(0, 0), expect: 0 },
  { fn: () => add(-1, 1), expect: 0 },
]
`),

  h3({ id: 'verbose-output' }, 'Verbose Output'),

  p('The -l (or --verbose, --loud) flag enables detailed output:'),

  Pre(`
# Shows all tests including passing ones
t -l
`),

  p('What verbose mode shows:'),

  ul([
    li('All test results (not just failures)'),
    li('Individual test execution time'),
    li('Full test names with suite hierarchy'),
    li('Detailed error messages with stack traces'),
  ]),

  p('Default mode (without -l):'),

  ul([
    li('Only shows failing tests'),
    li('Shows summary only for passing suites'),
    li('Faster output for large test suites'),
  ]),

  p('Example output without -l:'),

  Pre(`
### Testing package: my-lib
/addition.js => Pass: 3/3 100%
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
`),

  p('Example output with -l:'),

  Pre(`
### Testing package: my-lib
▶ addition
  ✔ adds two positive numbers (1.2ms)
  ✔ handles zero correctly (0.8ms)
  ✔ handles negative numbers (0.9ms)
▶ multiplication
  ✔ multiplies by zero (0.7ms)
  ✔ multiplies by one (0.6ms)
  ✔ multiplies two positives (0.8ms)
  ✔ handles negative numbers (0.9ms)
Ran 7 tests in 12ms. Passed 7/7 100%
`),

  h3({ id: 'common-pitfalls' }, 'Common Pitfalls'),

  p('Avoid these common mistakes when writing tests:'),

  p('1. Forgetting to return in async tests:'),

  Pre(`
# Wrong: promise resolves before test checks result
export default {
  fn: async () => {
    const result = await someAsyncFunction()
    # missing return!
  },
  expect: true,
}

# Correct:
export default {
  fn: async () => {
    return await someAsyncFunction()
  },
  expect: true,
}
`),

  p('2. Not wrapping callback functions:'),

  Pre(`
# Wrong: function gets called immediately
export default {
  fn: doSomething(),  # executes immediately!
  expect: true,
}

# Correct: wrap in function to defer execution
export default {
  fn: () => doSomething(),
  expect: true,
}
`),

  p('3. Mutating shared state between tests:'),

  Pre(`
# Wrong: counter persists between tests
let counter = 0
export default [
  { fn: () => ++counter, expect: 1 },
  { fn: () => ++counter, expect: 2 }, # fails! counter is now 1
]

# Correct: use local state or reset in beforeEach
let counter = 0
const beforeEach = () => { counter = 0 }
export default {
  beforeEach,
  tests: [
    { fn: () => ++counter, expect: 1 },
    { fn: () => ++counter, expect: 1 }, # passes - reset before each
  ],
}
`),

  p('4. Using the wrong equality check:'),

  Pre(`
# Wrong: checks reference equality
export default {
  fn: () => [1, 2, 3],
  expect: [1, 2, 3], # fails! different arrays
}

# Correct: use @magic/types for deep comparison
import { is } from '@magic/test'
export default {
  fn: () => [1, 2, 3],
  expect: is.deep.equal([1, 2, 3]),
}
`),

  p('5. Not awaiting async operations:'),

  Pre(`
# Wrong: test finishes before promise resolves
export default {
  fn: () => {
    setTimeout(() => {
      # This never gets checked!
    }, 100)
  },
  expect: true,
}

# Correct: return the promise
export default {
  fn: () => new Promise(resolve => {
    setTimeout(() => resolve(true), 100)
  }),
  expect: true,
}

# Or use the promise helper:
import { promise } from '@magic/test'
export default {
  fn: promise(cb => setTimeout(() => cb(null, true), 100)),
  expect: true,
}
`),

  p('6. Incorrect hook usage:'),

  Pre(`
# Wrong: before/after hooks on individual tests, not suites
export default [
  {
    fn: () => true,
    beforeAll: () => {}, # wrong! beforeAll is for suites
    afterAll: () => {},
    expect: true,
  },
]

# Correct: hooks at suite level
const beforeAll = () => {}
const afterAll = () => {}
export default {
  beforeAll,
  afterAll,
  tests: [
    { fn: () => true, expect: true },
  ],
}
   `),

   h3({ id: 'error-codes' }, 'Error Codes'),

   p([
     '@magic/test uses error codes to help with debugging and programmatic error handling.',
     ' You can import these constants from `@magic/test`:',
   ]),

   Pre(`
import { ERRORS, errorify } from '@magic/test'
`),

   p('Available error codes:'),

   ul([
     li('ERRORS.E_EMPTY_SUITE - Test suite is not exporting any tests'),
     li('ERRORS.E_RUN_SUITE_UNKNOWN - Unknown error occurred while running a suite'),
     li('ERRORS.E_TEST_NO_FN - Test object is missing the fn property'),
     li('ERRORS.E_TEST_EXPECT - Test expectation failed'),
     li('ERRORS.E_TEST_BEFORE - Before hook failed'),
     li('ERRORS.E_TEST_AFTER - After hook failed'),
     li('ERRORS.E_TEST_FN - Test function threw an error'),
     li('ERRORS.E_NO_TESTS - No test suites found'),
     li('ERRORS.E_IMPORT - Failed to import a test file'),
     li('ERRORS.E_MAGIC_TEST - General test execution error'),
   ]),

   p('Example usage:'),

   Pre(`
try {
  // run tests
} catch (e) {
  if (e.code === ERRORS.E_TEST_NO_FN) {
    console.error('Test is missing fn property:', e.message)
  }
}
`),
]
