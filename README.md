# @magic/test

declaratively test your ecmascript module files

no transpiling of either your codebase nor the tests.

incredibly fast.

[html docs](https://magic.github.io/test)

[![NPM version][npm-image]][npm-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]

<!-- [![Linux Build Status][travis-image]][travis-url] -->
<!-- [![Windows Build Status][appveyor-image]][appveyor-url] -->

[npm-image]: https://img.shields.io/npm/v/@magic/test.svg
[npm-url]: https://www.npmjs.com/package/@magic/test
[travis-image]: https://img.shields.io/travis/com/magic/test/master
[travis-url]: https://travis-ci.com/magic/test
[appveyor-image]: https://img.shields.io/appveyor/ci/magic/test/master.svg
[appveyor-url]: https://ci.appveyor.com/project/magic/test/branch/master
[coveralls-image]: https://coveralls.io/repos/github/magic/test/badge.svg
[coveralls-url]: https://coveralls.io/github/magic/test
[greenkeeper-image]: https://badges.greenkeeper.io/magic/test.svg
[greenkeeper-url]: https://badges.greenkeeper.io/magic/test.svg
[snyk-image]: https://snyk.io/test/github/magic/test/badge.svg
[snyk-url]: https://snyk.io/test/github/magic/test

- [install](#install)
- [npm scripts](#npm-scripts)
- [usage](#usage)
- [data/fs driven test suites](#test-suites)
- [writing tests](#tests)
  - [js types](#tests-types)
  - [typescript](#tests-typescript)
  - [multiple tests in one file](#tests-multiple)
  - [running tests multiple times](#tests-runs)
  - [promises](#tests-promises)
  - [callback functions](#tests-cb)
  - [run function before / after individual tests](#tests-hooks)
  - [run function before / after suite of tests](#tests-suite-hooks)
  - [beforeEach and afterEach](#tests-each-hooks)
  - [test @magic-modules](#tests-magic-modules)
- [utility functions](#lib)
  - [deep](#lib-deep)
  - [fs](#lib-fs)
- [curry](#lib-curry)
- [log](#lib-log)
- [vals](#lib-vals)
  - [env](#lib-env)
  - [Environment Constants](#lib-env-constants)
  - [promises](#lib-promises)
  - [http](#lib-http)
  - [tryCatch](#lib-trycatch)
  - [error](#lib-error)
  - [version](#lib-version)
  - [mock](#lib-mock)
  - [DOM Environment](#lib-dom)
  - [svelte (experimental!)](#lib-svelte)
- [Native Node.js Test Runner](#native-runner)
  - [Usage](#native-usage)
  - [Using in External Libraries](#native-external)
  - [Features](#native-features)
  - [Differences from Custom Runner](#native-differences)
  - [Test Isolation](#test-isolation)
- [Cli / Js Api Usage](#usage)
  - [js api](#usage-js)
  - [cli](#usage-cli)
  - [npm i -g](#usage-global)
  - [Exit Codes](#exit-codes)
  - [Performance Tips](#performance-tips)
  - [Verbose Output](#verbose-output)
  - [Common Pitfalls](#common-pitfalls)

#### <a name="install"></a>getting started

be in a nodejs project.

```bash
npm i --save-dev @magic/test

mkdir test
```

create ./test/yourFileToTest.{js,ts}, the filename is used in the test output,
the path should be the same as the file in your src dir, the path is used in the log messages.

```javascript
// ./test/yourLibToTest.{js,ts}
import yourLibToTest from '../path/to/your/lib.js'

export default [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the function will be called automagically. expect: true is optional.
  { fn: yourLibToTest.returnsTrue, /* expect: true, */ info: 'yourLibToTest returns true' },
  // if you need arguments, call the function. also works with async/await.
  {
    fn: yourLibToTest.withArgs('argument1', 'argument2'),
    expect: 'string',
    info: 'yourLibToTest.withArgs returns "string"',
  },
  // if you absolutely need to nest your function in a function call
  {
    fn: () => yourLibToTest.withArgs('argument1', 'argument2'),
    expect: true,
    info: 'nested functions work.',
  },
]
```

###### <a name="npm-scripts"></a>npm run scripts

edit package.json:

```json5
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
  }
}

repeated for easy copy pasting (without comments):
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  }
```

run the test:

```bash
  npm test
```

example output, from this repository, lots of worker tests:
(passing test files are silent if -p is passed)

```
###  Testing package: @magic/test

Ran 1235 tests in 1.7s. Passed 1235/1235 100%

```

fastest tests from a private project

```
###  Testing package: @artificialmuseum/engine

Ran 90307 tests in 274.5ms. Passed 90307/90307 100%
Ran 90307 tests in 265.5ms. Passed 90307/90307 100%
Ran 90307 tests in 268.1ms. Passed 90307/90307 100%
```

run coverage reports and get full test report including from passing tests:

```bash
  npm run coverage
```

##### <a name="test-suites"></a>data/fs driven test suite creation:

- **expectations for optimal test messages:**
- src and test directories have the same structure and files.
- tests one src file per test file.
- tests one function per suite
- tests one feature per test

###### Filesystem based naming

the following directory structure:

```
./test/
  ./suite1.js
  ./suite2.js
```

has the same result as exporting the following from ./test/index.js

###### Data driven naming

```javascript
import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}
```

##### Important

if test/index.js exists, no other files will be loaded.

if test/lib/index.js exists, no other files from that subdirectory will be loaded.

##### <a name="tests"></a>single test, literal value, function or promise

```javascript
export default { fn: true, expect: true, info: 'expect true to be true' }

// expect: true is the default
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
export default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }
```

###### <a name="tests-types"></a> testing types

types can be compared using [@magic/types](https://github.com/magic/types)

@magic/types is a full featured and thoroughly tested type library
without dependencies.

it is exported from this library for convenience.

```javascript
import { is } from '@magic/test'
export default [
  { fn: () => 'string', expect: is.string, info: 'test if a function returns a string' },
  {
    fn: () => 'string',
    expect: is.length.equal(6),
    info: 'test length of returned value',
  },
  // !!! Testing for deep equality. simple.
  {
    fn: () => [1, 2, 3],
    expect: is.deep.equal([1, 2, 3]),
    info: 'deep compare arrays/objects for equality',
  },
  {
    fn: () => {
      key: 1
    },
    expect: is.deep.different({ value: 1 }),
    info: 'deep compare arrays/objects for difference',
  },
]
```

###### Caveat:

if you want to test if a function is a function, wrap the function

```javascript
import { is } from '@magic/test'
const fnToTest = () => {}
export default {
  fn: () => fnToTest,
  expect: is.function,
  info: 'function is a function',
}
```

###### <a name="tests-typescript"></a> TypeScript support

@magic/test supports TypeScript test files. You can write tests in `.ts` files and they will be executed directly without transpilation.

```javascript
// test/mytest.ts
export default { fn: () => true, expect: true, info: 'TypeScript test works!' }
```

This requires Node.js 22.18.0 or later.

##### <a name="tests-multiple"></a> multiple tests

multiple tests can be created by exporting an array or object of single test objects.

```javascript
// exporting an array
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]

// or exporting an object with named test arrays
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ],
}
```

##### <a name="tests-promises"></a>promises

```javascript
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
```

##### <a name="tests-runs"></a>running tests multiple times

Use the `runs` property to run a test multiple times:

```javascript
import { is } from '@magic/test'

export default [
  {
    fn: Math.random(),
    expect: is.number,
    runs: 5,
    info: 'runs the test 5 times and expects all returns to be numbers',
  },
]
```

##### <a name="tests-cb"></a>callback functions

```javascript
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
```

##### <a name="tests-hooks"></a>run functions before and/or after individual test

```javascript
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
```

##### <a name="tests-suite-hooks"></a>run functions before and/or after a suite of tests

```javascript
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
    // this is optional if beforeall returns a function.
    // in this example, afterAll will trigger twice.
    afterAll,
    expect: () => global.testing === 'changed in test',
  },
```

**File-based Hooks:**

You can also create `test/beforeAll.js` and `test/afterAll.js` files that run before/after all tests in a suite. If the exported function returns another function, it will be executed after the suite completes.

**Note:** These files must be placed at the **root** `test/` directory (not in subdirectories).

```javascript
// test/beforeAll.js
export default () => {
  global.setup = true
  // optionally return a cleanup function
  return () => {
    global.setup = false
  }
}
```

```javascript
// test/afterAll.js
export default () => {
  // cleanup after all tests
}
```

##### <a name="tests-each-hooks"></a>beforeEach and afterEach hooks

You can also define `beforeEach` and `afterEach` hooks in your test objects that run before/after each individual test:

```javascript
const beforeEach = () => {
  // Runs before each test in this suite
  global.testState = { initialized: true }
}

const afterEach = testResult => {
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
```

##### <a name="tests-magic-modules"></a>test @magic-modules

@magic-modules assume all html tags to be globally defined.
to create those globals for your test and check if a @magic-module returns the correct markup, call one of the tags in your test function:

```javascript
export default [
  { fn: () => i('testing'), expect: ['i', 'testing'], info: '@magic/test can now test html' },
]
```

#### <a name="lib">Utility Belt

@magic/test exports some utility functions that make working with complex test workflows simpler.

###### <a name="lib-deep"></a>deep

Exported from [@magic/deep](https://github.com/magic/deep), deep equality and comparison utilities.

```javascript
import { deep, is } from '@magic/test'

export default [
  {
    fn: () => ({ a: 1, b: 2 }),
    expect: deep.equal({ a: 1, b: 2 }),
    info: 'deep equals comparison',
  },
  {
    fn: () => ({ a: 1 }),
    expect: deep.different({ a: 2 }),
    info: 'deep different comparison',
  },
  {
    fn: () => ({ a: { b: 1 } }),
    expect: deep.equal({ a: { b: 1 } }),
    info: 'nested deep equality',
  },
]
```

**Available functions:**

- `deep.equal(a, b)` - deep equality check
- `deep.different(a, b)` - deep difference check
- `deep.contains(container, item)` - deep inclusion check
- `deep.changes(a, b)` - get differences between objects

###### <a name="lib-fs"></a>fs

Exported from [@magic/fs](https://github.com/magic/fs), file system utilities.

```javascript
import { fs } from '@magic/test'

export default [
  {
    fn: async () => {
      const content = await fs.readFile('./package.json', 'utf-8')
      return content.includes('name')
    },
    expect: true,
    info: 'read file content',
  },
]
```

**Common methods:**

- `fs.readFile(path, encoding)` - read file content
- `fs.writeFile(path, data)` - write file content
- `fs.exists(path)` - check if file exists
- `fs.mkdir(path, options)` - create directory
- `fs.rmdir(path)` - remove directory
- `fs.stat(path)` - get file stats
- `fs.readdir(path)` - read directory contents
- Plus async versions in `fs.promises`

###### <a name="lib-curry"></a>curry

Currying splits a function's arguments into nested functions.
Useful for shimming functions with many arguments.

```javascript
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
```

###### <a name="lib-log"></a>log

Logging utility for test output. Colors supported automatically.

```javascript
import { log } from '@magic/test'

log.debug('Debug info')
log.info('Something happened')
log.warn('Heads up')
log.error('Something went wrong')
log.critical('Game over')
```

Supports template strings and arrays:

```javascript
log.info('Testing', library, 'at version', version)
```

###### <a name="lib-vals"></a> vals

Exports JavaScript type constants for testing against any value. Useful for fuzzing and property-based testing.

```javascript
import { vals, is } from '@magic/test'

export default [
  { fn: () => 'test', expect: is.string, info: 'test if value is a string' },
  { fn: () => vals.true, expect: true, info: 'boolean true value' },
  { fn: () => vals.email, expect: is.email, info: 'valid email format' },
  { fn: () => vals.error, expect: is.error, info: 'error instance' },
]
```

**Available Constants:**

| Category     | Constants                                                         |
| ------------ | ----------------------------------------------------------------- |
| Primitives   | `true`, `false`, `number`, `num`, `float`, `int`, `string`, `str` |
| Empty values | `nil`, `emptystr`, `emptyobject`, `emptyarray`, `undef`           |
| Collections  | `array`, `object`, `obj`                                          |
| Time         | `date`, `time`                                                    |
| Errors       | `error`, `err`                                                    |
| Colors       | `rgb`, `rgba`, `hex3`, `hex6`, `hexa4`, `hexa8`                   |
| Other        | `func`, `truthy`, `falsy`, `email`, `regexp`                      |

##### <a name="lib-env"></a>env

Environment detection utilities for conditional test behavior.

**Available utilities:**

- `isNodeProd` - checks if NODE_ENV is set to production
- `isNodeDev` - checks if NODE_ENV is set to development
- `isProd` - checks if -p flag is passed to the CLI
- `isVerbose` - checks if -l flag is passed to the CLI
- `getErrorLength` - returns error length limit from MAGIC_TEST_ERROR_LENGTH env var (0 = unlimited)

```javascript
import { env, isProd, isTest, isDev } from '@magic/test'

export default [
  {
    fn: env.isNodeProd,
    expect: process.env.NODE_ENV === 'production',
    info: 'checks if NODE_ENV is production',
  },
  {
    fn: env.isNodeDev,
    expect: process.env.NODE_ENV === 'development',
    info: 'checks if NODE_ENV is development',
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
  {
    fn: env.getErrorLength,
    expect: 70, // default, can be overridden by MAGIC_TEST_ERROR_LENGTH
    info: 'get error length limit',
  },
]
```

##### <a name="lib-env-constants"></a>Environment Constants

These boolean constants reflect the current NODE_ENV:

- `isProd` - true when NODE_ENV is 'production'
- `isTest` - true when NODE_ENV is 'test' (default)
- `isDev` - true when NODE_ENV is 'development'

```javascript
import { isProd, isTest, isDev } from '@magic/test'

export default [
  { fn: isProd, expect: process.env.NODE_ENV === 'production' },
  { fn: isTest, expect: process.env.NODE_ENV === 'test' },
  { fn: isDev, expect: process.env.NODE_ENV === 'development' },
]
```

##### <a name="lib-promises"></a>promises

Helper function to wrap nodejs callback functions and promises with ease.
Handles the try/catch steps internally and returns a resolved or rejected promise.

```javascript
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
```

**Note:** `stringify` and `handleResponse` are internal utilities and are not exported.

###### <a name="lib-http"></a>http

HTTP utility for making requests in tests. Supports both HTTP and HTTPS.

```javascript
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
```

**Error Handling:**

```javascript
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
```

**Note:** The HTTP module automatically handles:

- Protocol detection (HTTP vs HTTPS)
- JSON parsing for responses with `Content-Type: application/json`
- Raw string returns for non-JSON responses
- `rejectUnauthorized: false` for self-signed certificates

**Note:** `css` is internal, not exported.

###### <a name="lib-trycatch"></a> tryCatch

allows to catch and test functions without bubbling the errors up into the runtime

```javascript
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
    info: 'function does not throw',
  },
]
```

###### <a name="lib-error"></a> error

export [@magic/error](https://github.com/magic/error) which returns errors with optional names.

```javascript
import { error } from '@magic/test'

export default [
  {
    fn: tryCatch(error('Message', 'E_NAME')),
    expect: e => e.name === 'E_NAME' && e.message === 'Message',
    info: 'Errors have messages and (optional) names.',
  },
]
```

###### <a name="lib-version"></a> version

The version plugin checks your code according to a spec defined by you. This is designed to warn you on changes to your exports. Internally, the version function calls @magic/types and all functions exported from it are valid type strings in version specs.

```javascript
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

  // Test parent object without checking child properties
  objectNoChildCheck: ['obj', false],
}

export default version(lib, spec)
```

**Note:** Using `['obj', false]` in a spec will test that the parent is an object without checking the key/value pairs inside.

###### <a name="lib-mock"></a> mock

Mock and spy utilities for function testing.

```javascript
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
```

**mock.fn properties:**

- `calls` - Array of all call arguments
- `returns` - Array of all return values
- `errors` - Array of all thrown errors (null for non-throwing calls)
- `callCount` - Number of times called

**mock.fn methods:**

- `mockReturnValue(value)` - Set return value (chainable)
- `mockThrow(error)` - Set error to throw (chainable)
- `getCalls()` - Get all call arguments
- `getReturns()` - Get all return values
- `getErrors()` - Get all thrown errors

##### <a name="lib-dom"></a>DOM Environment

@magic/test automatically initializes a DOM environment when imported, making browser APIs available in Node.js.

**Available globals:**

- Core: `document`, `window`, `self`, `navigator`, `location`, `history`
- DOM types: `Node`, `Element`, `HTMLElement`, `SVGElement`, `Document`, `DocumentFragment`
- Events: `Event`, `CustomEvent`, `MouseEvent`, `KeyboardEvent`, `InputEvent`, `TouchEvent`, `PointerEvent`
- Forms: `FormData`, `File`, `FileList`, `Blob`
- Networking: `URL`, `URLSearchParams`, `XMLHttpRequest`, `fetch`, `WebSocket`
- Storage: `Storage`, `sessionStorage`, `localStorage`
- Observers: `MutationObserver`, `IntersectionObserver`, `ResizeObserver`
- File APIs: `FileReader`, `AbortController`, `AbortSignal`
- Streams: `ReadableStream`, `WritableStream`, `TransformStream`
- Misc: `DOMParser`, `XMLSerializer`, `TextEncoder`, `TextDecoder`, `atob`, `btoa`
- Timers: `setTimeout`, `setInterval`, `requestAnimationFrame`

**DOM Utilities:**

```javascript
import { initDOM, getDocument, getWindow } from '@magic/test'

// Get the document and window instances
const doc = getDocument()
const win = getWindow()

// Manually re-initialize if needed
initDOM()
```

**Canvas/Image Polyfills:**

- `new Image()` - Parses PNG data URLs to extract dimensions
- `canvas.getContext('2d')` - Returns node-canvas context
- `canvas.toDataURL()` - Serializes canvas to data URL

###### <a name="lib-svelte"></a>Svelte Testing

**Svelte support is VERY experimental and will be expanded whenever we write tests for our libraries.**

@magic/test has built-in support for testing Svelte 5 components. Compiles Svelte, mounts them in a DOM, and gives you utilities to interact and assert.

```javascript
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
```

**Automatic Test Exports**

When testing Svelte 5 components, @magic/test automatically exports `$state` and `$derived` variables, making them accessible in tests without requiring manual exports.

**Note:** This automatic export feature is specific to **Svelte 5** only. Svelte 4 components do not have this capability.

```svelte
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
  // No export needed!
</script>

<button class="inc">+</button>
<span>{doubled}</span>
```

```javascript
// Test - works automatically!
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count, // 0
    expect: 0,
    info: 'access $state without manual export',
  },
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.doubled, // 0 (derived)
    expect: 0,
    info: 'access $derived without manual export',
  },
]
```

This works automatically for all `$state` and `$derived` runes in your component.

**Exported Functions:**

| Function                               | Description                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `mount(filePath, options)`             | Mounts a Svelte component and returns the target, component instance, and unmount function |
| `html(target)`                         | Returns the innerHTML of a mounted component's target element                              |
| `text(target)`                         | Returns the textContent of a target element                                                |
| `component(instance)`                  | Returns the component instance for accessing exported values                               |
| `props(target)`                        | Returns an object of attribute name/value pairs from the target element                    |
| `click(target, selector?)`             | Clicks an element (optionally filtered by CSS selector)                                    |
| `trigger(target, eventType, options?)` | Dispatches a custom event on an element                                                    |
| `scroll(target, x, y)`                 | Scrolls an element to x/y coordinates                                                      |

**Test Properties:**

| Property    | Type       | Description                                              |
| ----------- | ---------- | -------------------------------------------------------- |
| `component` | `string`   | Path to the .svelte file                                 |
| `props`     | `object`   | Props to pass to the component                           |
| `fn`        | `function` | Test function receiving `{ target, component, unmount }` |

**Example: Accessing Component State**

```javascript
import { mount, html } from '@magic/test'
import { tick } from 'svelte'

const component = './src/lib/svelte/components/Counter.svelte'

export default [
  {
    component,
    fn: async ({ target, component: instance }) => {
      // Access exported state from the component
      return instance.count
    },
    expect: 0,
    info: 'initial count is 0',
  },
  {
    component,
    fn: async ({ target, component: instance }) => {
      // Click the increment button and check state
      target.querySelector('.increment').click()
      await tick()
      return instance.count
    },
    expect: 1,
    info: 'count increments on button click',
  },
]
```

**Example: Testing Error Handling**

```javascript
import { mount, tryCatch } from '@magic/test'

const component = './src/lib/svelte/components/MyComponent.svelte'

export default [
  {
    fn: tryCatch(mount, component, { props: null }),
    expect: t => t.message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
  {
    fn: tryCatch(mount, component, { props: 'invalid' }),
    expect: t => t.message === 'Props must be an object, got string',
    info: 'throws when props is a string',
  },
]
```

**SvelteKit Mocks:**

Mocks SvelteKit's $app modules:

```javascript
import { browser, dev, prod, createStaticPage } from '@magic/test'

export default [
  {
    fn: () => browser, // true if in browser environment
    expect: false,
    info: 'not in browser by default',
  },
  {
    fn: () => dev, // true if in dev mode
    expect: process.env.NODE_ENV === 'development',
    info: 'dev reflects NODE_ENV',
  },
  {
    fn: () => prod, // true if in production mode
    expect: false,
    info: 'not in prod by default',
  },
]
```

**compileSvelte:**

Compile Svelte component source to a module for testing:

```javascript
import { compileSvelte } from '@magic/test'

export default [
  {
    fn: async () => {
      const source = `<button>Click</button>`
      const { js, css } = compileSvelte(source, 'button.svelte')
      return js.code.includes('button') && css.code === ''
    },
    expect: true,
    info: 'compiles Svelte source to module',
  },
]
```

#### <a name="native-runner"></a>Native Node.js Test Runner

@magic/test includes a native Node.js test runner using `--test`.

##### <a name="native-usage"></a>Usage

```bash
# Run tests using Node.js native test runner
npm run test:native
```

Add to your `package.json`:

```json5
{
  scripts: {
    test: 't -p',
    'test:native': 'node --test src/bin/node-test-runner.js',
  },
}
```

##### <a name="native-external"></a>Using in External Libraries

To use the native test runner in your own library that depends on @magic/test:

1. **Copy the runner file** to your project:

```bash
# Copy node-test-runner.js to your project
cp node_modules/@magic/test/src/bin/node-test-runner.js src/
```

2. **Update the paths** in the runner if needed (it uses relative paths to find the test directory)

3. **Add the script** to your package.json:

```json
{
  "scripts": {
    "test": "t -p",
    "test:native": "node --test src/bin/node-test-runner.js"
  }
}
```

##### <a name="native-features"></a>Features

The native runner supports all the same features as the custom runner:

- Test file discovery (`.js`, `.mjs`, `.ts`)
- File-based hooks (`beforeAll.js`, `afterAll.js`)
- Svelte component testing
- All assertion types
- Global magic modules

##### <a name="native-differences"></a>Differences from Custom Runner

| Feature        | Custom Runner        | Native Runner             |
| -------------- | -------------------- | ------------------------- |
| Test discovery | Custom glob patterns | Node.js `--test` patterns |
| Output format  | Colored CLI output   | Node.js test format       |
| Hooks          | Full support         | Full support              |
| Coverage       | Via c8               | Not available             |

##### <a name="test-isolation"></a>Test Isolation

@magic/test supports test isolation to prevent tests from affecting each other. Tests in the same suite can share state, but you can isolate them:

```javascript
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
```

**Global Isolation Mode:**

By default, tests in the same file share global state. To enable strict isolation where each test gets a fresh environment:

```javascript
// This runs each test in isolation with fresh globals
export const __isolate = true

export default [
  { fn: () => (global.test = 1), expect: 1 },
  { fn: () => global.test === undefined, expect: true, info: 'fresh global state' },
]
```

**Programmatic Detection:**

You can programmatically check if a suite requires isolation using the `suiteNeedsIsolation` utility:

```javascript
import { suiteNeedsIsolation } from '@magic/test'

const needsIsolation = suiteNeedsIsolation(tests)
```

This is useful for custom runners or when building test tooling.

#### <a name="usage"></a>Usage

#### <a name="usage-js"></a>js api:

```javascript
// test/index.js

import { run } from '@magic/test'

const tests = {
  lib: [{ fn: () => true, expect: true, info: 'Expect true to be true' }],
}

run(tests)
```

**Programmatic API:**

The `run` function accepts test suites and runs them programmatically:

```javascript
import { run, is } from '@magic/test'

const tests = {
  myLib: [
    { fn: () => true, expect: true, info: 'true is true' },
    { fn: () => 'test', expect: is.string, info: 'returns a string' },
    { fn: () => ({ a: 1 }), expect: is.deep.equal({ a: 1 }), info: 'deep equals' },
  ],
}

// run returns a promise
await run(tests)
```

#### <a name="usage-cli"></a>cli

##### package.json (recommended):

Add the magic/test bin scripts to package.json

```json
{
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}
```

then use the npm run scripts

```bash
  npm test
  npm run coverage
```

##### <a name="usage-global"></a>Globally (not recommended):

you can install this library globally,
but the recommendation is to add the dependency and scripts to the package.json file.

this both explains to everyone that your app has this dependencies
and keeps your bash free of clutter

```bash
  npm i -g @magic/test

  // run tests in production mode
  t -p

  // run tests in verbose mode
  t
```

**CLI Flags:**

| Flag         | Aliases                  | Description                                  |
| ------------ | ------------------------ | -------------------------------------------- |
| `-p`         | `--production`, `--prod` | Run tests without coverage (faster)          |
| `-l`         | `--verbose`, `--loud`    | Show detailed output including passing tests |
| `-i`         | `--include`              | Files to include in coverage                 |
| `-e`         | `--exclude`              | Files to exclude from coverage               |
| `--shard-id` |                          | Shard ID (0-indexed) to run                  |
| `--help`     |                          | Show help text                               |

**Note:** `--shards` and `--shard-id` must be used together. `--shard-id` is 0-indexed (0 to N-1).

**Common Usage:**

````bash
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

#### Sharding Tests

Run tests in parallel across multiple processes to speed up large test suites:

```bash
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2
````

Tests are distributed deterministically using a hash of the test file path, ensuring:

- Each test always runs in the same shard (consistent across runs)
- No duplicate test execution across shards
- Even distribution based on file paths

This hash-based approach guarantees that sharding is reproducible and works well with CI caching.

Add to your `package.json` for CI/CD:

```json
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
```

Or use a single command to run all shards in parallel:

```bash
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
```

This library tests itself, have a look at [the tests](https://github.com/magic/test/tree/master/test)

Checkout [@magic/types](https://github.com/magic/types)
and the other magic libraries for more test examples.

#### Exit Codes

@magic/test returns specific exit codes to indicate test results:

| Exit Code | Meaning                  |
| --------- | ------------------------ |
| `0`       | All tests passed         |
| `1`       | One or more tests failed |

```bash
# Run tests and check exit code
npm test
echo "Exit code: $?"  # 0 = success, 1 = failure
```

#### Performance Tips

Follow these tips to get the most out of @magic/test:

**Use the `-p` flag for development:**

```bash
# Fast mode - no coverage, only shows failures
npm test
# or
t -p
```

**Shard large test suites:**

```bash
# Split tests across multiple processes
t --shards 4 --shard-id 0
```

**Run tests in parallel with native runner:**

```bash
# Native runner uses Node.js built-in test runner
npm run test:native
```

**Minimize async overhead:**

```javascript
// Slower: unnecessary async
export default {
  fn: async () => {
    return true
  },
  expect: true,
}

// Faster: sync test
export default {
  fn: () => true,
  expect: true,
}
```

**Use local state instead of globals:**

```javascript
// Slower: global state requires isolation
export const __isolate = true

// Faster: local state is naturally isolated
export default [
  {
    fn: () => {
      const counter = 0
      return ++counter
    },
    expect: 1,
  },
]
```

**Batch related tests:**

```javascript
// Faster: single suite with multiple tests
export default [
  { fn: () => add(1, 2), expect: 3 },
  { fn: () => add(0, 0), expect: 0 },
  { fn: () => add(-1, 1), expect: 0 },
]
```

#### Verbose Output

The `-l` (or `--verbose`, `--loud`) flag enables detailed output:

```bash
# Shows all tests including passing ones
t -l
```

**What verbose mode shows:**

- All test results (not just failures)
- Individual test execution time
- Full test names with suite hierarchy
- Detailed error messages with stack traces

**Default mode (without `-l`):**

- Only shows failing tests
- Shows summary only for passing suites
- Faster output for large test suites

**Example output without `-l`:**

```
### Testing package: my-lib
/addition.js => Pass: 3/3 100%
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
```

**Example output with `-l`:**

```
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
```

#### Common Pitfalls

Avoid these common mistakes when writing tests:

**1. Forgetting to return in async tests:**

```javascript
// Wrong: promise resolves before test checks result
export default {
  fn: async () => {
    const result = await someAsyncFunction()
    // missing return!
  },
  expect: true,
}

// Correct:
export default {
  fn: async () => {
    return await someAsyncFunction()
  },
  expect: true,
}
```

**2. Not wrapping callback functions:**

```javascript
// Wrong: function gets called immediately
export default {
  fn: doSomething(),  // executes immediately!
  expect: true,
}

// Correct: wrap in function to defer execution
export default {
  fn: () => doSomething(),
  expect: true,
}
```

**3. Mutating shared state between tests:**

```javascript
// Wrong: counter persists between tests
let counter = 0
export default [
  { fn: () => ++counter, expect: 1 },
  { fn: () => ++counter, expect: 2 }, // fails! counter is now 1
]

// Correct: use local state or reset in beforeEach
let counter = 0
const beforeEach = () => { counter = 0 }
export default {
  beforeEach,
  tests: [
    { fn: () => ++counter, expect: 1 },
    { fn: () => ++counter, expect: 1 }, // passes - reset before each
  ],
}
```

**4. Using the wrong equality check:**

```javascript
// Wrong: checks reference equality
export default {
  fn: () => [1, 2, 3],
  expect: [1, 2, 3], // fails! different arrays
}

// Correct: use @magic/types for deep comparison
import { is } from '@magic/test'
export default {
  fn: () => [1, 2, 3],
  expect: is.deep.equal([1, 2, 3]),
}
```

**5. Not awaiting async operations:**

```javascript
// Wrong: test finishes before promise resolves
export default {
  fn: () => {
    setTimeout(() => {
      // This never gets checked!
    }, 100)
  },
  expect: true,
}

// Correct: return the promise
export default {
  fn: () => new Promise(resolve => {
    setTimeout(() => resolve(true), 100)
  }),
  expect: true,
}

// Or use the promise helper:
import { promise } from '@magic/test'
export default {
  fn: promise(cb => setTimeout(() => cb(null, true), 100)),
  expect: true,
}
```

**6. Incorrect hook usage:**

```javascript
// Wrong: before/after hooks on individual tests, not suites
export default [
  {
    fn: () => true,
    beforeAll: () => {}, // wrong! beforeAll is for suites
    afterAll: () => {},
    expect: true,
  },
]

// Correct: hooks at suite level
const beforeAll = () => {}
const afterAll = () => {}
export default {
  beforeAll,
  afterAll,
  tests: [
    { fn: () => true, expect: true },
  ],
}
```

#### Error Codes

@magic/test uses error codes to help with debugging and programmatic error handling. You can import these constants from `@magic/test`:

| Code                         | Description                                  |
| ---------------------------- | -------------------------------------------- |
| `ERRORS.E_EMPTY_SUITE`       | Test suite is not exporting any tests        |
| `ERRORS.E_RUN_SUITE_UNKNOWN` | Unknown error occurred while running a suite |
| `ERRORS.E_TEST_NO_FN`        | Test object is missing the `fn` property     |
| `ERRORS.E_TEST_EXPECT`       | Test expectation failed                      |
| `ERRORS.E_TEST_BEFORE`       | Before hook failed                           |
| `ERRORS.E_TEST_AFTER`        | After hook failed                            |
| `ERRORS.E_TEST_FN`           | Test function threw an error                 |
| `ERRORS.E_NO_TESTS`          | No test suites found                         |
| `ERRORS.E_IMPORT`            | Failed to import a test file                 |
| `ERRORS.E_MAGIC_TEST`        | General test execution error                 |

Example usage:

```javascript
import { ERRORS, errorify } from '@magic/test'

try {
  // run tests
} catch (e) {
  if (e.code === ERRORS.E_TEST_NO_FN) {
    console.error('Test is missing fn property:', e.message)
  }
}
```

### Changelog

#### 0.1.0

use esmodules instead of commonjs.

#### 0.1.1

rework of bin scripts and update dependencies to esmodules

#### 0.1.2

cli now works on windows again (actually, this version is broken on all platforms.)

#### 0.1.3

cli now works everywhere

#### 0.1.4

npm run scripts of @magic/test itself can be run on windows.

#### 0.1.5

use ecmascript version of @magic/deep

#### 0.1.6

- update this readme and html docs.
- tests should always process.exit(1) if they errored.

#### 0.1.7

- readded calls npm run script
- updated c8

#### 0.1.8

update @magic/cli

#### 0.1.9

- test/beforeAll.js gets loaded separately if it exists and executed before all tests
- test/afterAll.js gets loaded separately if it exists and executed after all tests
- if the function exported from test/beforeAll.js returns another function,
  this returned function will also be executed after all tests
- export hyperapp beta 18

#### 0.1.10

node 12.4.0 does not use --experimental-json-modules flag. removed it in 12.4+.

#### 0.1.11

- update prettier, coveralls
- add and export @magic/css to test css validity

#### 0.1.12

update dependencies

#### 0.1.13

windows support is back

#### 0.1.14

windows support now supports index.js files that provide test structure

#### 0.1.15

update dependencies

#### 0.1.16

update @magic/cli for node 13 support.

#### 0.1.17

add node 13 json support for coverage reports.

#### 0.1.18

- update dependencies
- require node 12.13.0

#### 0.1.19

update dependencies

#### 0.1.20

update broken dependencies

#### 0.1.21

update @magic/cli to allow default args

#### 0.1.22

update dependencies

#### 0.1.23

update @magic dependencies to use npm packages instead of github

#### 0.1.24

- update @magic/css
- update c8

#### 0.1.25

- currying now throws errors instead of returning them.
- update @magic/css
- update @magic/types which now uses @magic/deep for is.deep.eq and is.deep.diff

#### 0.1.26

remove commonjs support. node 13+ required. awesome.

#### 0.1.27

remove prettier from deps

#### 0.1.28

- package: engineStrict: true
- update cli: missing @magic/cases dependency

#### 0.1.29

help text can show up when --help is used

#### 0.1.30

export @magic/fs

#### 0.1.31

update dependencies

#### 0.1.32

- tests now work on windows \o/
- uncaught errors will cause tests to fail with process.exit(1)

#### 0.1.33

update exported dependencies

#### 0.1.34

fix: c8 needs "report" command now

#### 0.1.35

- fix: c8 errored if coverage dir did not exist
- update dependencies

#### 0.1.36

c8: --exclude, --include and --all get applied correctly.

#### 0.1.37

fix: arguments for both node and c8 tests work. broken in 0.1.36

#### 0.1.38

update dependencies, minimist sec issue.

#### 0.1.39

update coveralls, fix minimist issue above.

##### 0.1.40

update dependencies

##### 0.1.41

update dependencies

##### 0.1.42

update dependencies

##### 0.1.43

update dependencies

##### 0.1.44

update dependencies

##### 0.1.45

security fix: update dependencies, yargs-parser.

##### 0.1.46

update @magic/css

##### 0.1.47

update c8, yargs-parser

##### 0.1.48

bump required node version to 14.2.0
update dependencies

##### 0.1.49

update @magic/css

##### 0.1.50

- remove @magic/css export
- update c8

##### 0.1.51

- update dependencies

##### 0.1.52

- update dependencies
- remove hyperapp from exports.

##### 0.1.53

update dependencies

##### 0.1.54

update dependencies

##### 0.1.55

update dependencies

##### 0.1.56

update dependencies

##### 0.1.57

update dependencies

##### 0.1.58

update dependencies

##### 0.1.58

update dependencies

##### 0.1.59

update dependencies

##### 0.1.60

- bump required node version to 14.15.4
- update dependencies

##### 0.1.61

update dependencies

##### 0.1.62

- add html flag to tests, now @magic-modules can be tested \o/
- update dependencies

##### 0.1.63

update dependencies (c8)

##### 0.1.64

update dependencies (@magic/fs)

##### 0.1.65

- update dependencies
- testing of @magic-modules is now built in.
  if @magic/core is installed, the tests will "just work" and return html for @magic-modules

##### 0.1.66

- better handling if magic is not in use

##### 0.1.67

- silence errors if magic.js does not exist

##### 0.1.68

update @magic/core to fix tests if magic.js does not exist

##### 0.1.69

import of magic config should work on windows

##### 0.1.70

update dependencies

##### 0.1.71

update dependencies

##### 0.1.72

update @magic/types and intermediate deps to avoid circular dependency

##### 0.1.73

update dependencies

##### 0.1.74

update dependencies

##### 0.1.75

update dependencies

##### 0.1.76

update dependencies

##### 0.1.77

update dependencies

##### 0.2.0

- update dependencies
- version now tests spec and lib in a single run.

##### 0.2.1

- internal restructuring
- tests now output their run duration
- add @magic/error dependency and export it from index
- index.js files have the same functionality as index.js files
- update dependencies

##### 0.2.2

spec values can be functions, allowing arbitrary equality testing to be executed by @magic/test.version

##### 0.2.3

update dependencies

##### 0.2.4

- lib/version: spec can have objects defined with ['obj', false], which will test the parent to be an object,
  but does not test the key/value pairs in the object.
- maybeInjectMagic: made magic injection more robust and much faster if magic is not being used.
- t -p now does not show the coverage information

##### 0.2.5

- update dependencies
- @magic/core is a dev dependency now.

##### 0.2.6

update dependencies

##### 0.2.7

- update dependencies
- replace coveralls with coveralls-next

##### 0.2.8

update dependencies

##### 0.2.9

update dependencies

##### 0.2.10

@magic/test can now test @magic/core again

##### 0.2.11

update dependencies

##### 0.2.12

update dependencies

##### 0.2.13

update dependencies

##### 0.2.14

update dependencies

##### 0.2.15

- update dependencies
- percentage outputs print nicer numbers
- added http export that allows http requests in tests. only supports get requests for now.

##### 0.2.16

update dependencies

##### 0.2.17

- remove calls and coveralls-next, c8 takes care of coverage.
- update dependencies

##### 0.2.18

- add missing fs.statfs, fs.statfsSync and fs.promises.constants to test/spec
- update dependencies

##### 0.2.19

- update dependencies
- add unused http.post. probably should replace http with fetch...

##### 0.2.20

- update dependencies

##### 0.2.21

- update dependencies

##### 0.2.22

- add comprehensive typescript types
- rework some functionality to be typesafe and typeguarded
- update dependencies

##### 0.2.23

- readd npm run prepublishOnly task
- update dependencies

##### 0.2.24

- fix @magic/core tests on windows.

##### 0.2.25

- update dependencies

##### 0.2.26

- update dependencies

##### 0.2.27

- allow resolving .js files as .ts files, this mimics typescript .js file resolver
- update @types/node

##### 0.2.28

- use node:module register function for loader, allowing use of the --import flag instead of soon deprecated --loader.

##### 0.2.29

- tryCatch: pass on empty args
- update dependencies

##### 0.2.30

- allow tests to be written using typescript, .ts files can be test files now.
- add some internal tests
- update dependencies

##### 0.3.0 - BROKEN. node can not strip types in node_modules...

- added html support (using happy-dom, experimental!)
- added svelte support (experimental!)
- various improvements to test logic and structure of internal lib
- more tests.

##### 0.3.1

- publish dist dir with .js files for consumers.

##### 0.3.2 - unreleased

...
