# @magic/test

Simple, declarative, opinionated.

#### Usage

##### js api:
```javascript
  // test/index.js

  const run = require('@magic/test')

  const tests = {
    lib: [
      { fn: () => true, expect: true, info: 'Expect true to be true' }
    ]
  }

  run(tests)
```

##### cli

First create test file:
```javascript
  // test/index.js

  const tests = {
    lib: [
      { fn: () => true, expect: true, info: 'Expect true to be true' }
    ]
  }

  module.exports = tests

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

or in package.json:
```json
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
    "format": "f -w",
    "format:check": "f"
  },
  "dependencies": {
    "@magic/test": "github:magic/test"
  }
}
```

This library tests itself, have a look at [the tests](https://github.com/magic/test/tree/master/test)

Checkout [@magic/types](https://github.com/magic/types)
and the other magic libraries for complex examples.
