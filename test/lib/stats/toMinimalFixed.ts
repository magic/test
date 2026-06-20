import { toMinimalFixed } from '../../../src/lib/stats/toMinimalFixed.js'
import type { TestCase } from '../../../src/types.js'

export default [
  // Basic usage
  {
    fn: () => toMinimalFixed(100, 0),
    expect: 100,
    info: 'returns integer when fix is 0',
  },
  {
    fn: () => toMinimalFixed(99.9, 0),
    expect: 100,
    info: 'rounds to nearest integer',
  },
  {
    fn: () => toMinimalFixed(99.4, 0),
    expect: 99,
    info: 'rounds down when < .5',
  },
  // Default fix = 2
  {
    fn: () => toMinimalFixed(99.876, 2),
    expect: 99.88,
    info: 'defaults to 2 decimal places',
  },
  {
    fn: () => toMinimalFixed(99.874, 2),
    expect: 99.87,
    info: 'rounds to 2 decimals',
  },
  // Different fix values
  {
    fn: () => toMinimalFixed(99.9876, 3),
    expect: 99.988,
    info: 'handles 3 decimal places',
  },
  {
    fn: () => toMinimalFixed(99.9, 1),
    expect: 99.9,
    info: 'handles 1 decimal place',
  },
  // Edge cases
  {
    fn: () => toMinimalFixed(0, 2),
    expect: 0,
    info: 'handles zero',
  },
  {
    fn: () => toMinimalFixed(-99.876, 2),
    expect: -99.88,
    info: 'handles negative numbers',
  },
  {
    fn: () => toMinimalFixed(0.001, 2),
    expect: 0,
    info: 'rounds small positive numbers',
  },
] satisfies TestCase[]
