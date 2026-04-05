import is from '@magic/types'
import { tryCatch, curry } from '../../src/index.js'

const fn = (v: unknown) => v

const add = (a: number, b: number, c: number) => a + b + c

const curryAny = (...args: unknown[]) => {
  return curry(...args)
}

export default [
  { fn: () => curryAny(fn, 'test'), expect: 'test' },
  {
    fn: () =>
      curryAny(
        'test',
        (a: unknown, b: unknown, c: unknown) => (a as number) + (b as number) + (c as number),
        'test2',
      ) as unknown,
    expect: is.fn,
  },
  { fn: () => curryAny('test', (a: string, b: string) => a + b, 'test2'), expect: 'testtest2' },
  { fn: () => curryAny('test', (v: unknown) => v), expect: 'test' },
  { fn: () => curryAny(() => true), expect: true },
  { fn: () => curryAny(() => {}), expect: undefined },
  { fn: tryCatch(curryAny), expect: is.error },
  { fn: () => curryAny((v: unknown) => v), expect: is.function },
  { fn: () => curryAny((_a: unknown) => {}), expect: is.function },
  { fn: () => curryAny(is.type, 'object'), expect: is.function },
  { fn: () => curryAny(add, 1)(2)(3), expect: 6 },
  { fn: () => curryAny(add, 1)(2)(-3), expect: 0 },
  { fn: tryCatch(curryAny, add, 1, 2, 3, 4), expect: is.error },
]
