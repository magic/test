import is from '@magic/types'
import log from '@magic/log'

import { vals } from '../../src/lib/index.js'

const testVals = [
  { fn: is.array, items: [vals.array, vals.emptyarray] },
  { fn: is.boolean, items: [vals.true, vals.false] },
  { fn: is.truthy, items: [vals.truthy] },
  { fn: is.falsy, items: [vals.falsy] },
  { fn: is.null, items: [vals.nil] },
  { fn: is.string, items: [vals.emptystr, vals.string, vals.str] },
  { fn: is.object, items: [vals.emptyobject, vals.object, vals.obj] },
  { fn: is.function, items: [vals.func] },
  {
    fn: is.number,
    items: [vals.number, vals.num, vals.int, vals.float, vals.time],
  },
  { fn: is.float, items: [vals.float] },
  { fn: is.int, items: [vals.int] },
  { fn: is.mail, items: [vals.email] },
  { fn: is.undefined, items: [vals.undefined, vals.undef] },
  { fn: is.date, items: [vals.date] },
  { fn: is.error, items: [vals.error, vals.err] },
  { fn: is.rgb, items: [vals.rgb] },
  { fn: is.rgba, items: [vals.rgba] },
  { fn: is.hex3, items: [vals.hex3] },
  { fn: is.hex6, items: [vals.hex6] },
  { fn: is.hexa4, items: [vals.hexa4] },
  { fn: is.hexa8, items: [vals.hexa8] },
  { fn: is.regexp, items: [vals.regexp] },
]

// flatten val array
let len = 0
testVals.forEach(val => {
  len += val.items.length
})

const compare = fn => item => {
  if (!fn(item)) {
    log.error('compare errored', { item })
  }

  return fn(item)
}

const equal =
  ({ fn, compare, items }) =>
  () =>
    items.every(compare(fn))

const createTest = ({ fn, items, compare }) => ({
  fn: equal({ fn, items, compare }),
  info: `test val types`,
})

// test every nested types array for equality with the other array elements
const equalities = testVals.map(({ fn, items }) => createTest({ fn, items, compare }))

export default [
  {
    fn: () => Object.keys(vals).length,
    // use log for internal warning. do not do this.
    expect: a => a < len || log.error('E_MISSING_SPEC_TESTS', `Missing Spec Tests ${a} ${len}`),
    info: 'Number of test functions is equal to lib functions',
  },
  ...equalities,
]
