# @magic/test

Simple, declaratice testing library.

##### Usage

```javascript
  const run = require('@magic/test')

  const tests = {
    lib: [
      { fn: () => true, expect: true, info: 'Expect true to be true' }
    ]
  }

  run(tests)
```

This library tests itself, have a look at [the tests](https://github.com/magic/test/tree/master/test)

Checkout [@magic/types](https://github.com/magic/types) for an even more in depth example
