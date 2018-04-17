const is = require('@magic/types')
const vals = require('../src/vals')

const testVals = {
  array: ['array', 'emptyarray'],
  boolean: ['true', 'false'],
  truthy: ['truthy'],
  falsy: ['falsy'],
  null: ['nil'],
  string: ['emptystr', 'string', 'str'],
  object: ['emptyobject', 'object', 'obj'],
  function: ['func'],
  number: ['number', 'num', 'int', 'float', 'time'],
  float: ['float'],
  int: ['int'],
  mail: ['email'],
  undefined: ['undefined', 'undef'],
  date: ['date'],
  error: ['error', 'err'],
  rgb: ['rgb'],
  rgba: ['rgba'],
  hex3: ['hex3'],
  hex6: ['hex6'],
  hexa4: ['hexa4'],
  hexa8: ['hexa8'],
  regexp: ['regexp'],
}

// flatten val array
const flat = Object.values(testVals).reduce((glob = [], v) => glob.concat(v))

const compare = (fn, items) =>
  items.some(
    item =>
      !is[fn](vals[item])
        ? console.log('errored', { fn, items }) || false
        : true,
  )

const equal = (fn, items) => () => compare(fn, items)

// test every nested types array for equality with the other array elements
const equalities = Object.entries(testVals).map(([fn, items]) => ({
  fn: equal(fn, items),
  info: `test function equality: ${items}`,
}))

const fns = [
  {
    fn: () => Object.keys(vals).filter(k => flat.indexOf(k) === -1),
    expect: a => a.length === 0 || console.log('Missing Spec Tests', a),
    info: 'Number of test functions is equal to lib functions',
  },
  ...equalities,
]

module.exports = fns
