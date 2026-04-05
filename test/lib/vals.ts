import is from '@magic/types'
import log from '@magic/log'
import { vals } from '../../src/index.js'

type IsFn = (item: unknown) => boolean

interface TestVal {
  fn: IsFn
  items: unknown[]
}

const testVals: TestVal[] = [
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

let len = 0
testVals.forEach(val => {
  len += val.items.length
})

const compare = (fn: IsFn) => (item: unknown) => {
  if (!fn(item)) {
    log.error('compare errored', { item })
  }
  return fn(item)
}

const equal =
  ({ fn, items }: TestVal) =>
  () =>
    items.every(compare(fn))

const createTest = ({ fn, items }: TestVal) => ({
  fn: equal({ fn, items }),
  info: `test val types`,
})

const equalities = testVals.map(({ fn, items }) => createTest({ fn, items }))

export default [
  {
    fn: () => Object.keys(vals as object).length,
    expect: (a: number) =>
      a < len || log.error('E_MISSING_SPEC_TESTS', `Missing Spec Tests ${a} ${len}`),
    info: 'Number of test functions is equal to lib functions',
  },
  ...equalities,
]
