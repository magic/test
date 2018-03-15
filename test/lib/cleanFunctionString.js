const { cleanFunctionString } = require('../../src/lib')

const fns = [
  { fn: () => cleanFunctionString(async () => await true), expect: 'true' },
  { fn: () => cleanFunctionString(async (t) => await true), expect: 'true' },
  { fn: () => cleanFunctionString(async t => await true), expect: 'true' },

  { fn: () => cleanFunctionString((t) => true), expect: 'true' },
  { fn: () => cleanFunctionString(t => true), expect: 'true' },
  { fn: () => cleanFunctionString(() => true), expect: 'true' },

  { fn: () => cleanFunctionString((async () => await true).toString()), expect: 'true' },
  { fn: () => cleanFunctionString((async (t) => await true).toString()), expect: 'true' },
  { fn: () => cleanFunctionString((async t => await true).toString()), expect: 'true' },

  { fn: () => cleanFunctionString(((t) => true).toString()), expect: 'true' },
  { fn: () => cleanFunctionString((t => true).toString()), expect: 'true' },
  { fn: () => cleanFunctionString((() => true).toString()), expect: 'true' },

  { fn: () => cleanFunctionString(), expect: false },
  { fn: () => cleanFunctionString(1), expect: 1 },
]

module.exports = fns
