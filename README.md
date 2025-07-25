# @magic/test

declaratively test your ecmascript module files

no transpiling of either your codebase nor the tests.

incredibly fast.

[html docs](https://magic.github.io/test)

[![NPM version][npm-image]][npm-url]
[![Linux Build Status][travis-image]][travis-url]
[![Windows Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]

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
  - [multiple tests in one file](#tests-multiple)
  - [promises](#tests-promises)
  - [callback functions](#tests-cb)
  - [run function before / after individual tests](#tests-hooks)
  - [run function before / after suite of tests](#tests-suite-hooks)
  - [test @magic-modules](#tests-magic-modules)
- [utility functions](#lib)
  - [curry](#lib-curry)
  - [vals](#lib-vals)
  - [promises](#lib-promises)
  - [css](#lib-css)
  - [tryCatch](#lib-trycatch)
- [Cli / Js Api Usage](#usage)
  - [js api](#usage-js)
  - [cli](#usage-cli)
  - [npm i -g](#usage-global)

#### <a name="install"></a>getting started

be in a nodejs project.

```bash
npm i --save-dev @magic/test

mkdir test
```

create test/index.js

```javascript
import yourTest from '../path/to/your/file.js'

export default [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the function will be called automagically
  { fn: yourTest, expect: true, info: 'hope this will work ;)' },
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

###### caveat:

if you want to test if a function is a function, you need to wrap the function

```javascript
import { is } from '@magic/test'
const fnToTest = () => {}
export default {
  fn: () => fnToTest,
  expect: is.function,
  info: 'function is a function',
}
```

##### <a name="tests-multiple"></a> multiple tests

multiple tests can be created by exporting an array of single test objects.

```javascript
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
    // this is optional and can be omitted if beforeall returns a function.
    // in this example, afterAll will trigger twice.
    afterAll,
    expect: () => global.testing === 'changed in test',
  },
```

##### <a name="tests-magic-modules"></a>test @magic-modules

@magic-modules assume all html tags to be globally defined.
to create those globals for your test and check if a @magic-module returns the correct markup, just add an html: true flag to the test:

```javascript
export default [
  { fn: () => i('testing'), expect: ['i', 'testing'], info: '@magic/test can now test html' },
]
```

#### <a name="lib">Utility Belt

@magic/test exports some utility functions that make working with complex test workflows simpler.

###### <a name="lib-curry"></a>curry

Currying can be used to split the arguments of a function into multiple nested functions.
This helps if you have a function with complicated arguments that you just want to quickly shim.

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

###### <a name="lib-vals"></a> vals

exports some javascript types. more to come. will sometime in the future be the base of a fuzzer.

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

##### <a name="lib-css"></a>css

exports [@magic/css](https://github.com/magic/css)
which allows parsing and stringification of css-in-js objects.

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

##### <a name="lib-error"></a>error

export [@magic/error](https://github.com/magic/error)
which returns errors with optional names.

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

#### <a name="usage"></a>Usage

#### <a name="usage-js"></a>js api:

```javascript
// test/index.js

import run from '@magic/test'

const tests = {
  lib: [{ fn: () => true, expect: true, info: 'Expect true to be true' }],
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
```

This library tests itself, have a look at [the tests](https://github.com/magic/test/tree/master/test)

Checkout [@magic/types](https://github.com/magic/types)
and the other magic libraries for more test examples.

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

- test/beforeAll.mjs gets loaded separately if it exists and executed before all tests
- test/afterAll.mjs gets loaded separately if it exists and executed after all tests
- if the function exported from test/beforeAll.mjs returns another function,
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

windows support now supports index.mjs files that provide test structure

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
- index.js files have the same functionality as index.mjs files
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
- added http export that allows http requests in tests, there might be dragons and future updates are expected. only supports get requests for now.

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

##### 0.2.22 - unreleased

...
