# @magic/test

very simple tests.

#### Dependencies:
* [@magic/log](https://github.com/magic/log): console.log wrapper with loglevels
* [@magic/types](https://github.com/magic/types): type checking library
* [nyc](https://www.npmjs.com/package/nyc): code coverage
* [prettier](https://www.npmjs.com/package/prettier): code formatting

@magic/log and @magic/types have no dependencies.

#### quick start:
be in a nodejs project.
```bash
  #no @ before magic!
  npm i --save-dev magic/test

  mkdir test  
```

create test/index.js
```javascript
  module.exports = [
    { fn: () => true, expect: true, info: 'true is true' },
  ]
```

edit package.json:
```json5
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
    "format": "f -w", // format using prettier and write changes to files
    "format:check": "f" // check format using prettier
  },
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

Ran 2 tests. Passed 1/2 50%
```

run coverage reports and get full test report including from passing tests:
```bash
  npm run coverage
```

#### test files:

##### filesystem based naming

* **expectations for optimal test messages:**
* src and test directories have the same structure and files.
* tests one src file per test file.
* tests one function per suite
* tests one feature per test

##### structure:

###### Filesystem based naming
the following directory structure:
```
./test/
  ./suite1.js
  ./suite2.js
```

has the same result as exporting the following from ./test/index.js
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

###### Manual Names

if we export an object, we get named suites without corresponding file structure

```javascript
  module.exports {
    suite1: [ // suites are just arrays of tests
      { fn: false, expect: false, info: 'tests are objects with fn, expect and info fields' },
      { fn: true, info: 'if the result is true, expect can be omitted' },
    ],
    suite2: [],
  }
```


##### single test, literal value, function or promise

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

  // types can be compared using @magic/types
  const { is } = require('@magic/test')
  module.exports = { fn: true, expect: is.boolean, info: 'magic/types are awesome' }

  // caveat:
  // if you want to test if a function is a function, you need to wrap the function
  const fnToTest = () => {}
  module.exports = { fn: () => fnToTest, expect: is.function, info: 'magic/types are awesome' }
```

##### multiple tests

```javascript
  module.exports = {
    multipleTests: [
      { fn: () => true, expect: true, info: 'expect true to be true' },
      { fn: () => false, expect: false, info: 'expect false to be false' },
    ]
  }
```

##### promises
```javascript
  module.exports = {
    fn: new Promise(r => setTimeOut(() => r(true), 2000)),
    expect: true,
    info: 'handle promises',
  }
```

##### callback functions
```javascript
  const { promise } = require('@magic/test')

  const fnWithCallback = (err, arg, cb) => cb(err, arg)

  module.exports: [
      {
        fn: promise(cb => fnWithCallback(null, true, cb)),
        expect: true
        info: 'handle nodejs callback functions'}
    ],

  }

```

##### run functions before and/or after individual test
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

##### run functions before and/or after a suite of tests
```javascript
  const afterAll = () => {
    global.testing = 'Test has finished, cleanup.'
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
      afterAll,
      expect: () => global.testing === 'changed in test',
    },
```

##### types
[@magic/types](https://github.com/magic/types)
is a fully featured and throughly tested type library
without dependencies. it is included in this library.
```javascript
  const { is } = require('@magic/test')

  module.exports = [
    { fn: () => 'string', expect: is.string, info: 'test if a function returns a string' },
    { fn: () => 'string', expect: is.length.equal(6), info: 'test length of returned value' },
    { fn: () => [1, 2, 3], expect: is.deep.equal([1, 2, 3]), info: 'deep compare values' },
    // ... see the @magic/types library for a full list of functions
  ]
```


#### Usage

#### js api:

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

#### cli

First create test file:
```javascript
  // test/index.js
  module.exports = {
    lib: [
      { fn: () => true, expect: true, info: 'Expect true to be true' }
    ]
  }
```

Then either use test globally:
```bash
  npm i -g magic/test

  // run tests in production mode
  t -p
  t --prod
  t --production
  test --p
  test --prod
  test --production

  // run tests in verbose mode
  t
  test

  // check formatting using prettier but do not write
  // prettier --list-different
  f
  format

  // format files using prettier
  // prettier --write
  f -w
  format -w

```


#### package.json:
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

This library tests itself, have a look at [the tests](https://github.com/magic/test/tree/master/test)

Checkout [@magic/types](https://github.com/magic/types)
and the other magic libraries for complex test examples.
