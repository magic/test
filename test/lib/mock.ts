// import is from '@magic/types'
import { mock } from '../../src/index.js'
import { tryCatch } from '../../src/lib/tryCatch.js'

export default [
  // {
  //   fn: () => {
  //     const spy = mock.fn()
  //     return spy
  //   },
  //   expect: is.function,
  //   info: 'mock.fn returns a function that tracks calls',
  // },
  {
    fn: () => {
      const spy = mock.fn()
      spy('arg1')
      spy('arg2')
      return spy.calls.length === 2 && spy.calls[0]?.[0] === 'arg1' && spy.calls[1]?.[0] === 'arg2'
    },
    expect: true,
    info: 'mock.fn tracks call arguments',
  },
  {
    fn: () => {
      const spy = mock.fn(() => 'result')
      const result = spy()
      return result === 'result'
    },
    expect: true,
    info: 'mock.fn uses implementation function',
  },
  {
    fn: () => {
      const spy = mock.fn().mockReturnValue('mocked')
      return spy() === 'mocked'
    },
    expect: true,
    info: 'mock.fn.mockReturnValue sets return value',
  },
  {
    fn: () => {
      const spy = mock.fn().mockReturnValue('first')
      spy()
      spy.mockReturnValue('second')
      return spy() === 'second'
    },
    expect: true,
    info: 'mock.fn.mockReturnValue is chainable and updates value',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      return spy.returns.length === 2
    },
    expect: true,
    info: 'mock.fn tracks return values',
  },
  {
    fn: async () => {
      const spy = mock.fn().mockThrow(new Error('test error'))
      const caught = (await tryCatch(spy)()) as Error
      return caught instanceof Error && caught.message === 'test error'
    },
    expect: true,
    info: 'mock.fn.mockThrow throws configured error',
  },
  {
    fn: () => {
      const spy = mock.fn()
      try {
        spy()
      } catch {
        // intentional empty catch
      }
      return spy.errors.length === 1 && spy.errors[0] === null
    },
    expect: true,
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
      return spy.errors.length === 2 && spy.errors[0]?.message === 'fail'
    },
    expect: true,
    info: 'mock.fn tracks errors for throwing calls',
  },
  {
    fn: () => {
      const obj = { greet: () => 'hello' }
      mock.spy(obj, 'greet', () => 'world')
      const result = obj.greet()
      return result === 'world'
    },
    expect: true,
    info: 'mock.spy replaces object method',
  },
  {
    fn: () => {
      const obj = { greet: () => 'original' }
      const _spy = mock.spy(obj, 'greet', () => 'mocked')
      obj.greet()
      _spy.mockRestore()
      return obj.greet() === 'original'
    },
    expect: true,
    info: 'mock.spy.mockRestore restores original method',
  },
  {
    fn: () => {
      const obj = { method: (..._args: unknown[]) => 'test' }
      const _spy = mock.spy(obj, 'method')
      obj.method('arg1', 'arg2')
      return (
        _spy.calls.length === 1 && _spy.calls[0]?.[0] === 'arg1' && _spy.calls[0]?.[1] === 'arg2'
      )
    },
    expect: true,
    info: 'mock.spy tracks arguments of spied method',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      const calls = spy.getCalls()
      const returns = spy.getReturns()
      return (
        calls.length === 2 &&
        returns.length === 2 &&
        calls[0]?.length === 0 &&
        returns[0] === undefined
      )
    },
    expect: true,
    info: 'getCalls and getReturns return correct arrays',
  },
  {
    fn: () => {
      const spy = mock.fn().mockReturnValue('value').mockReturnValue('value2')
      return spy._returnValue === 'value2'
    },
    expect: true,
    info: 'multiple mockReturnValue calls update value',
  },
  {
    fn: () => {
      const spy = mock.fn()
      spy()
      spy()
      const errors = spy.getErrors()
      return errors.length === 2 && errors[0] === null
    },
    expect: true,
    info: 'getErrors returns correct array',
  },
]
