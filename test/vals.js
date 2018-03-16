const vals = require('../src/vals')

const deep = require('deep')

// copy vals
const testVals = {
  array: ['test'],
  true: true,
  false: false,
  truthy: 'true',
  falsy: 0,
  nil: null,
  emptystr: '',
  emptyobject: {},
  emptyarray: [],
  number: 1234567890.0,
  num: 1237890,
  float: 1.1,
  int: 1,
  object: { test: 'test' },
  obj: { t: 't' },
  string: 'string',
  str: 'str',
  email: 'test@mail.mail',
  undefined: undefined,
  undef: undefined,
  rgb: { r: 1, g: 1, b: 1 },
  rgba: { r: 1, g: 1, b: 1, a: 1 },
  hex3: '#3d3',
  hex6: '#3d3d3d',
  hexa4: '#3d31',
  hexa8: '#3d3d3111',
  regexp: /test/,

  // pointers have to match
  func: vals.func,
  date: vals.date,
  time: vals.time,
  error: vals.error,
  err: vals.err,
}

const invalidTestVals = Object.assign({}, testVals, { t: 't'})

const fn = [
  { fn: () => deep.equals(testVals, vals), expect: true },
  { fn: () => deep.equals(invalidTestVals, vals), expect: false },
]

module.exports = fn
