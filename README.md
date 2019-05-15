# @magic/test

simple tests with lots of utility.

### docs are outdated. 

use .mjs files and import/export instead of (common)js require and module.exports.
docs will be updated soon, but thats the "only" change


[html docs](https://magic.github.io/test)

[![NPM version][npm-image]][npm-url]
[![Linux Build Status][travis-image]][travis-url]
[![Windows Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]

[npm-image]: https://img.shields.io/npm/v/@magic/test.svg
[npm-url]: https://www.npmjs.com/package/@magic/test
[travis-image]: https://api.travis-ci.org/magic/test.svg?branch=master
[travis-url]: https://travis-ci.org/magic/test
[appveyor-image]: https://img.shields.io/appveyor/ci/magic/test/master.svg
[appveyor-url]: https://ci.appveyor.com/project/magic/test/branch/master
[coveralls-image]: https://coveralls.io/repos/github/magic/test/badge.svg
[coveralls-url]: https://coveralls.io/github/magic/test
[greenkeeper-image]: https://badges.greenkeeper.io/magic/test.svg
[greenkeeper-url]: https://badges.greenkeeper.io/magic/test.svg
[snyk-image]: https://snyk.io/test/github/magic/test/badge.svg
[snyk-url]: https://snyk.io/test/github/magic/test


* [dependencies](#dependencies)
* [install](#install)
* [npm scripts](#npm-scripts)
* [usage](#usage)
* [data/fs driven test suites](#test-suites)
* [writing tests](#tests)
  * [js types](#tests-types)
  * [multiple tests in one file](#tests-multiple)
  * [promises](#tests-promises)
  * [callback functions](#tests-cb)
  * [run function before / after individual tests](#tests-hooks)
  * [run function before / after suite of tests](#tests-suite-hooks)
* [utility functions](#lib)
  * [curry](#lib-curry)
  * [vals](#lib-vals)
  * [tryCatch](#lib-trycatch)
  * [promises](#lib-promises)
* [Cli / Js Api Usage](#usage)
  * [js api](#usage-js)
  * [cli](#usage-cli)
  * [npm i -g](#usage-global)

#### dependencies:
* [@magic/log](https://github.com/magic/log): console.log wrapper with loglevels
* [@magic/types](https://github.com/magic/types): type checking library
* [nyc](https://www.npmjs.com/package/nyc): code coverage
* [prettier](https://www.npmjs.com/package/prettier): code formatting

@magic/log and @magic/types have no dependencies.

#### <a name="install"></a>getting started
be in a nodejs project.
```bash
npm i --save-dev @magic/test

mkdir test
```

create test/index.js
```javascript
const yourTest = require('../path/to/your/file.js')

module.exports = [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the function will be called automagically
  { fn: yourTest, expect: true, info: 'hope this will work ;)'}
]
```

###### <a name="npm-scripts"></a>npm run scripts
edit package.json:
```json5
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
    "format": "f -w", // format using prettier and write changes to files
    "format:check": "f" // check format using prettier
  }
}

repeated for easy copy pasting (without comments):
  "scripts": {
    "test": "t -p",
    "coverage": "t",
    "format": "f -w",
    "format:check": "f"
  }
```

run the test:
```bash
  npm test
```

example output:
(failing tests will print, passing tests are silent)
```
###  Testing package: @magic/test

Ran 2 tests. Passed 2/2 100%
```

run coverage reports and get full test report including from passing tests:
```bash
  npm run coverage
```

##### <a name="test-suites"></a>data/fs driven test suite creation:
* **expectations for optimal test messages:**
* src and test directories have the same structure and files.
* tests one src file per test file.
* tests one function per suite
* tests one feature per test


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
const suite1 = require('./suite1')
const suite2 = require('./suite2')

module.exports = {
  suite1,
  suite2,
}
```

##### Important
if test/index.js exists, no other files will be loaded.
if test/lib/index.js exists, no other files from that subdirectory will be loaded.


##### <a name="tests"></a>single test, literal value, function or promise

```javascript
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
module.exports = { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }
```

###### <a name="tests-types"></a> testing types
types can be compared using [@magic/types](https://github.com/magic/types)
@magic/types is a richly featured and thoroughly tested type library
without dependencies. it is exported from this library for convenience.

```javascript
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
]
```

###### caveat:
if you want to test if a function is a function, you need to wrap the function
```javascript
const { is } = require('@magic/test')
const fnToTest = () => {}
module.exports = {
  fn: () => fnToTest,
  expect: is.function,
  info: 'function is a function',
}
```

##### <a name="tests-multiple"></a> multiple tests
multiple tests can be created by exporting an array of single test objects.

```javascript
module.exports = {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}
```

##### <a name="tests-promises"></a>promises
```javascript
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
]
```

##### <a name="tests-cb"></a>callback functions
```javascript
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

module.exports = [
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
```

#### <a name="lib">Utility Belt
@magic/test exports some utility functions that make working with complex test workflows simpler.

###### <a name="lib-curry"></a>curry
Currying can be used to split the arguments of a function into multiple nested functions.
This helps if you have a function with complicated arguments that you just want to quickly shim.

```javascript
const { curry } = require('@magic/test')
const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

module.exports = {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
```

###### <a name="lib-vals"></a> vals
exports some javascript types. more to come. will sometime in the future be the base of a fuzzer.

##### <a name="lib-promises"></a>promises
Helper function to wrap nodejs callback functions and promises with ease.
Handles the try/catch steps internally and returns a resolved or rejected promise.

```javascript
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
]
```

###### <a name="lib-trycatch"></a> tryCatch
allows to catch and test functions without bubbling the errors up into the runtime
```javascript
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
]
```

#### <a name="usage"></a>Usage

#### <a name="usage-js"></a>js api:

```javascript
// test/index.js

const run = require('@magic/test')

const tests = {
  lib: [
    { fn: () => true, expect: true, info: 'Expect true to be true' }
  ],
}

run(tests)
```

#### <a name="usage-cli"></a>cli

##### package.json (recommended):
Add the magic/test bin scripts to package.json

```json
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
}
```

then use the npm run scripts
```bash
  npm test
  npm run coverage
  npm run format
  npm run format:check
```

##### <a name="usage-global"></a>Globally (not recommended):
you can of course install this library globally,
but the recommendation is to add the dependency and scripts to the package.json file.

this both explains to everyone that your app has this dependencies
and keeps your bash free of clutter

```bash
  npm i -g magic/test

  // run tests in production mode
  t -p

  // run tests in verbose mode
  t

  // check formatting using prettier but do not write
  // prettier --list-different
  f

  // format files using prettier
  // prettier --write
  f -w

```

This library tests itself, have a look at [the tests](https://github.com/magic/test/tree/master/test)

Checkout [@magic/types](https://github.com/magic/types)
and the other magic libraries for more test examples.

### Changelog

#### 0.1.0
use esmodules instead of commonjs.

#### 0.1.1
rework of bin scripts and update dependencies to esmodules
