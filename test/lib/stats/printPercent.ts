import { printPercent } from '#lib/stats/printPercent.js'
import { has } from '#lib/has.js'

export default [
  {
    fn: () => printPercent(100),
    expect: has.string('100'),
    info: 'prints 100 as 100',
  },
  // {
  //   fn: () => printPercent(0),
  //   expect: has.string('0'),
  //   info: 'prints 0 as 0',
  // },
  {
    fn: () => printPercent(50),
    expect: has.string('50'),
    info: 'prints 50 as 50',
  },
  {
    fn: () => printPercent(99.5),
    expect: has.string('99'),
    info: 'contains 99 for 99.5',
  },
  {
    fn: () => printPercent(99.9),
    expect: has.string('99'),
    info: 'contains 99 for 99.9',
  },
  {
    fn: () => printPercent(33.33),
    expect: has.string('33'),
    info: 'contains 33 for 33.33',
  },
]
