import { printPercent } from '../../../src/lib/stats/printPercent.js'

export default [
  {
    fn: () => printPercent(100).includes('100'),
    expect: true,
    info: 'prints 100 as 100',
  },
  // {
  //   fn: () => printPercent(0).includes('0'),
  //   expect: true,
  //   info: 'prints 0 as 0',
  // },
  {
    fn: () => printPercent(50).includes('50'),
    expect: true,
    info: 'prints 50 as 50',
  },
  {
    fn: () => printPercent(99.5).includes('99'),
    expect: true,
    info: 'contains 99 for 99.5',
  },
  {
    fn: () => printPercent(99.9).includes('99'),
    expect: true,
    info: 'contains 99 for 99.9',
  },
  {
    fn: () => printPercent(33.33).includes('33'),
    expect: true,
    info: 'contains 33 for 33.33',
  },
]
