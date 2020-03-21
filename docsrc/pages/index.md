# ${title}

${state.description}


<GitBadges>@magic/test</GitBadges>

## getting started

be in a nodejs project.

### #getting-started- install

`npm i --save-dev --save-exact @magic/test`

```
// create test/functionName.mjs
import yourTest from '../path/to/your/file.mjs'

export default [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the yourTest function will be called automagically
  { fn: yourTest, expect: true, info: 'hope this will work ;)'}
]
```

### #getting-started- npm scripts

edit package.json

```
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
  }
}
```

repeated for easy copy pasting (without comments)

```
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  }
```

### #getting-started- quick tests

without coverage

```
// run the tests:
npm test

// example output:
// (failing tests will print, passing tests are silent)

// ### Testing package: @magic/test
// Ran 2 tests. Passed 2/2 100%
```

### #getting-started- coverage

@magic/test will automagically generate coverage reports if it is not called with the -p flag.

### #test-suites data/fs driven test suite creation:

#### expectations for optimal test messages:

src and test directories have the same structure and files
tests one src file per test file
tests one function per suite
tests one feature per test

#### #test-suites-fs Filesystem based naming

the following directory structure:

```
./test/
  ./suite1.mjs
  ./suite2.mjs
```

yields the same result as exporting the following from ./test/index.mjs

#### #test-suites-data Data driven naming

```
import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}
```

### Important - File mappings

if test/index.mjs exists, no other files will be loaded.
if test/lib/index.mjs exists, no other files from that subdirectory will be loaded.

### #tests single test
literal value, function or promise

```
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

```

#### #tests-types testing types


types can be compared using [@magic/types](https://github.com/magic/types)

@magic/types is a richly featured and thoroughly tested type library without dependencies.
it is exported from this library for convenience.

```
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
```

#### caveat:

if you want to test if a function is a function, you need to wrap the function in a function.
this is because functions passed to fn get executed automatically.

```
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
]
```

```
// will not work as expected and instead call fnToTest
export default {
  fn: fnToTest,
  expect: is.function,
  info: 'function is a function',
}
```


### #tests-multiple multiple tests

multiple tests can be created by exporting an array of single test objects.

```
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}
```

multiple tests can also be created by exporting an array of tests.

```
  export default [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
```

### #tests- promises

```
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

### #tests-cb callback functions

```
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

### #tests- hooks

run functions before and/or after individual test

```
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
```

### #tests- suite hooks

run functions before and/or after a suite of tests

```
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
```

## #lib Utility Belt

@magic/test exports some utility functions that make working with complex test workflows simpler.

#### #lib- curry

Currying can be used to split the arguments of a function into multiple nested functions.

This helps if you have a function with complicated arguments
that you just want to quickly shim.

```
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

#### #lib- vals

exports some javascript types. more to come.
will sometime in the future be the base of a fuzzer.

### #lib- promises

Helper function to wrap nodejs callback functions and promises with ease.'
Handle the try/catch steps internally and return a resolved or rejected promise.'

```
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

### #lib- css

exports [@magic/css](https://github.com/magic/css),
which allows parsing and stringification of css-in-js objects.


#### #lib- trycatch

allows to test functions without bubbling the errors up into the runtime

```
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
```

## usage


### #usage- js

```
// test/index.mjs
import run from '@magic/test'

const tests = {
  lib: [
    { fn: () => true, expect: true, info: 'Expect true to be true' }
  ],
}

run(tests)
```

## #usage- cli

### package.json (recommended)

add the magic/test bin scripts to package.json

```
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}
```

then use the npm run scripts

```
npm test
npm run coverage
```

### #usage-global Globally (not recommended):

you can install this library globally,
but the recommendation is to add the dependency and scripts to the package.json file.


this both explains to everyone that your app has these dependencies
as well as keeping your bash free of clutter

```
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
```


This library tests itself, have a look at [the tests](https://github.com/magic/test/tree/master/test)

Checkout [@magic/types](https://github.com/magic/types/tree/master/test)
and the other magic libraries for more test examples.
