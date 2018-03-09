const t = require('../src/t')

const fn = {
  true: [
    { fn: () => t.true(true), expect: true },
    { fn: () => t.true(false), expect: false },
  ],
  ok: [
    { fn: () => t.ok(), expect: true },
    { fn: () => t.ok(false), expect: true },
  ],
  pass: [
    { fn: () => t.pass(), expect: true },
    { fn: () => t.pass(false), expect: true },
  ],
  false: [
    { fn: () => t.false(), expect: false },
    { fn: () => t.false(false), expect: true },
  ],
  fail: [
    { fn: () => t.fail(), expect: false },
    { fn: () => t.fail(true), expect: false },
  ],
  t: [
    { fn: () => t(true), expect: true },
    { fn: () => t(false), expect: false },
  ],
}

module.exports = fn
