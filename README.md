# @magic/test

very simple tests.

#### Dependencies:
* [@magic/log](https://github.com/magic/log): console.log wrapper with loglevels
* [@magic/types](https://github.com/magic/types): type checking library
* [nyc](https://www.npmjs.com/package/nyc): code coverage
* [prettier](https://www.npmjs.com/package/prettier): code formatting

@magic/log and @magic/types have no dependencies.

#### quick start:
```bash
// be in a nodejs project. no @ before magic!
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
```json
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
    "format": "f -w",
    "format:check": "f"
  },
}

```



#### test files:

##### filesystem based naming

you will get much better error messages if your src and test directories have the same structure.

you will get much better error messages if you are only testing one feature per test.

##### single test

```javascript
  module.exports = { fn: () => true, expect: true, info: 'expect true to be true' }
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
