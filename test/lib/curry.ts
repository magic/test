import { curry } from '#src/lib/curry.js'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // curry with function as first argument, one pre-filled arg
  {
    fn: () => {
      const sum = (a: number, b: number) => a + b
      const curried = curry(sum, 5)
      return typeof curried === 'function' && curried(3) === 8
    },
    expect: true,
    info: 'curry(sum, 5) returns function that adds 5 to argument',
  },
  // curry with function as first argument, two pre-filled args (immediate call)
  {
    fn: () => {
      const sum = (a: number, b: number) => a + b
      const result = curry(sum, 2, 3)
      return result === 5
    },
    expect: true,
    info: 'curry(sum, 2, 3) returns 5 (immediate call)',
  },
  // curry with function as first arg, no pre-filled args (returns function that needs all args)
  {
    fn: () => {
      const sum = (a: number, b: number) => a + b
      const curried = curry(sum)
      return (
        typeof curried === 'function' && typeof curried(2) === 'function' && curried(2)(3) === 5
      )
    },
    expect: true,
    info: 'curry(sum) returns function that needs all args',
  },
  // curry with function that takes 0 args
  {
    fn: () => {
      const getFive = () => 5
      const result = curry(getFive)
      return result === 5
    },
    expect: true,
    info: 'curry(getFive) returns 5 immediately',
  },
  // curry with function that takes 1 arg
  {
    fn: () => {
      const double = (x: number) => x * 2
      const curried = curry(double)
      return typeof curried === 'function' && curried(5) === 10
    },
    expect: true,
    info: 'curry(double) returns function that doubles argument',
  },
  // curry with function that takes 3 args
  {
    fn: () => {
      const sum3 = (a: number, b: number, c: number) => a + b + c
      const curried = curry(sum3, 1)
      const curried2 = (curried as (a: number) => unknown)(2)
      return typeof curried2 === 'function' && curried2(3) === 6
    },
    expect: true,
    info: 'curry(sum3, 1) chains correctly for 3-arg function',
  },
  // curry with function as last argument (finds function in args)
  {
    fn: () => {
      const sum = (a: number, b: number) => a + b
      const curried = curry(5, sum)
      return typeof curried === 'function' && curried(3) === 8
    },
    expect: true,
    info: 'curry(5, sum) finds function in args',
  },
  // Error: no function provided at all
  {
    fn: () => {
      try {
        curry(1, 2, 3)
        return false
      } catch (e) {
        return (
          e instanceof Error && e.message === 'curry expects a function as first or last argument'
        )
      }
    },
    expect: true,
    info: 'curry throws error when no function provided',
  },
  // Error: too many arguments
  {
    fn: () => {
      try {
        const sum = (a: number, b: number) => a + b
        curry(sum, 1, 2, 3)
        return false
      } catch (e) {
        return e instanceof Error && e.message === 'too many arguments passed to curried function'
      }
    },
    expect: true,
    info: 'curry throws error when too many arguments provided',
  },
  // Error: function not found in args
  {
    fn: () => {
      try {
        curry('not a function', 1, 2, 'also not a function')
        return false
      } catch (e) {
        return (
          e instanceof Error && e.message === 'curry expects a function as first or last argument'
        )
      }
    },
    expect: true,
    info: 'curry throws error when function not found',
  },
  // curry with undefined as first arg, function as second
  {
    fn: () => {
      const sum = (a: number, b: number) => a + b
      const curried = curry(undefined, sum)
      return typeof curried === 'function' && isNaN(curried(3))
    },
    expect: true,
    info: 'curry(undefined, sum) pre-fills with undefined',
  },
  // curry with null as first arg, function as second
  {
    fn: () => {
      const sum = (a: number, b: number) => a + b
      const curried = curry(null, sum)
      return typeof curried === 'function' && curried(3) === 3
    },
    expect: true,
    info: 'curry(null, sum) pre-fills with null',
  },
  // curry with empty string as first arg, function as second
  {
    fn: () => {
      const sum = (a: number, b: number) => a + b
      const curried = curry('', sum)
      return typeof curried === 'function' && curried(3) == 3 // empty string results in string
    },
    expect: true,
    info: 'curry("", sum) pre-fills with empty string',
  },
  // curry with number as first arg, function as second
  {
    fn: () => {
      const sum = (a: number, b: number) => a + b
      const curried = curry(42, sum)
      return typeof curried === 'function' && curried(3) === 45
    },
    expect: true,
    info: 'curry(42, sum) pre-fills with number',
  },
]

export default tests
