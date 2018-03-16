const { cleanFunctionString } = require('../../src/lib')

const fns = [
  { fn: () => cleanFunctionString(async () => true), expect: 'true' },
  { fn: () => cleanFunctionString(async (t) => true), expect: 'true' },
  { fn: () => cleanFunctionString(async t => true), expect: 'true' },

  { fn: () => cleanFunctionString((t) => true), expect: 'true' },
  { fn: () => cleanFunctionString(t => true), expect: 'true' },
  { fn: () => cleanFunctionString(() => true), expect: 'true' },

  { fn: () => cleanFunctionString((async () => true).toString()), expect: 'true' },
  { fn: () => cleanFunctionString((async (t) => true).toString()), expect: 'true' },
  { fn: () => cleanFunctionString((async t => true).toString()), expect: 'true' },

  { fn: () => cleanFunctionString(((t) => true).toString()), expect: 'true' },
  { fn: () => cleanFunctionString((t => true).toString()), expect: 'true' },
  { fn: () => cleanFunctionString((() => true).toString()), expect: 'true' },

  { fn: () => cleanFunctionString(), expect: false },
  { fn: () => cleanFunctionString(1), expect: 1 },
]

module.exports = fns
