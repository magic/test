import is from '@magic/types'
import { mock } from '../../src/index.js'
import { tryCatch } from '../../src/lib/tryCatch.js'
import type { TestCase } from '../../src/types.js'

export default [
  {
    fn: () => mock.fn(),
    expect: is.fn,
    info: 'mock.fn returns a function',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy('arg1')
      spy('arg2')
      return spy.calls.length
    },
    expect: 2,
    info: 'mock.fn tracks 2 calls',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy('arg1')
      spy('arg2')
      return spy.calls[0]?.[0]
    },
    expect: 'arg1',
    info: 'mock.fn first call arg is arg1',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy('arg1')
      spy('arg2')
      return spy.calls[1]?.[0]
    },
    expect: 'arg2',
    info: 'mock.fn second call arg is arg2',
  },
  {
    fn: () => {
      const spy = mock.fn(() => 'result')
      return spy()
    },
    expect: 'result',
    info: 'mock.fn uses implementation function',
  },
  {
    fn: () => {
      const spy = mock.fn().mockReturnValue('mocked')
      return spy()
    },
    expect: 'mocked',
    info: 'mock.fn.mockReturnValue sets return value',
  },
  {
    fn: () => {
      const spy = mock.fn().mockReturnValue('first')
      spy()
      spy.mockReturnValue('second')
      return spy()
    },
    expect: 'second',
    info: 'mock.fn.mockReturnValue is chainable',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      return spy.returns.length
    },
    expect: 2,
    info: 'mock.fn tracks return values',
  },
  {
    fn: async () => {
      const spy = mock.fn().mockThrow(new Error('test error'))
      const caught = (await tryCatch(spy)()) as Error
      return caught
    },
    expect: is.err,
    info: 'mock.fn.mockThrow throws Error',
  },
  {
    fn: async () => {
      const spy = mock.fn().mockThrow(new Error('test error'))
      const caught = (await tryCatch(spy)()) as Error
      return caught.message
    },
    expect: 'test error',
    info: 'mock.fn.mockThrow error message is correct',
  },
  {
    fn: () => {
      const spy = mock.fn()
      try {
        spy()
      } catch {
        // intentional empty catch
      }
      return spy.errors.length
    },
    expect: 1,
    info: 'mock.fn tracks 1 error for non-throwing call',
  },
  {
    fn: () => {
      const spy = mock.fn()
      try {
        spy()
      } catch {
        // intentional empty catch
      }
      return spy.errors[0]
    },
    expect: null,
    info: 'mock.fn tracks null for non-throwing calls',
  },
  {
    fn: () => {
      const spy = mock.fn().mockThrow(new Error('fail'))
      try {
        spy()
      } catch {
        // intentional empty catch
      }
      try {
        spy()
      } catch {
        // intentional empty catch
      }
      return spy.errors.length
    },
    expect: 2,
    info: 'mock.fn tracks 2 errors for throwing calls',
  },
  {
    fn: () => {
      const spy = mock.fn().mockThrow(new Error('fail'))
      try {
        spy()
      } catch {
        // intentional empty catch
      }
      try {
        spy()
      } catch {
        // intentional empty catch
      }
      return spy.errors[0]?.message
    },
    expect: 'fail',
    info: 'mock.fn tracks error message',
  },
  {
    fn: () => {
      const obj = { greet: () => 'hello' }
      mock.spy(obj, 'greet', () => 'world')
      return obj.greet()
    },
    expect: 'world',
    info: 'mock.spy replaces object method',
  },
  {
    fn: () => {
      const obj = { greet: () => 'original' }
      const _spy = mock.spy(obj, 'greet', () => 'mocked')
      obj.greet()
      _spy.mockRestore()
      return obj.greet()
    },
    expect: 'original',
    info: 'mock.spy.mockRestore restores original method',
  },
  {
    fn: () => {
      const obj = { method: (..._args: unknown[]) => 'test' }
      const _spy = mock.spy(obj, 'method')
      obj.method('arg1', 'arg2')
      return _spy.calls.length
    },
    expect: 1,
    info: 'mock.spy tracks 1 call',
  },
  {
    fn: () => {
      const obj = { method: (..._args: unknown[]) => 'test' }
      const _spy = mock.spy(obj, 'method')
      obj.method('arg1', 'arg2')
      return _spy.calls[0]?.[0]
    },
    expect: 'arg1',
    info: 'mock.spy first call arg is arg1',
  },
  {
    fn: () => {
      const obj = { method: (..._args: unknown[]) => 'test' }
      const _spy = mock.spy(obj, 'method')
      obj.method('arg1', 'arg2')
      return _spy.calls[0]?.[1]
    },
    expect: 'arg2',
    info: 'mock.spy first call arg2 is arg2',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      return spy.getCalls().length
    },
    expect: 2,
    info: 'getCalls returns 2 calls',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      return spy.getReturns().length
    },
    expect: 2,
    info: 'getReturns returns 2 returns',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      return spy.getCalls()[0]?.length
    },
    expect: 0,
    info: 'getCalls first call has 0 args',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      return spy.getReturns()[0]
    },
    expect: undefined,
    info: 'getReturns first return is undefined',
  },
  {
    fn: () => {
      const spy = mock.fn().mockReturnValue('value').mockReturnValue('value2')
      return spy._returnValue
    },
    expect: 'value2',
    info: 'multiple mockReturnValue calls update value',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      return spy.getErrors().length
    },
    expect: 2,
    info: 'getErrors returns 2 errors',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      return spy.getErrors()[0]
    },
    expect: null,
    info: 'getErrors first error is null for non-throwing',
  },
] satisfies TestCase[]
