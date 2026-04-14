import { mock, tryCatch } from '../../src/index.js'

const fn = mock.fn as any

export default [
  {
    fn: () => {
      const spy = fn()
      return typeof spy === 'function'
    },
    expect: true,
    info: 'mock.fn returns a function that tracks calls',
  },
  {
    fn: () => {
      const spy = fn()
      spy('arg1')
      spy('arg2')
      return spy.calls.length === 2 && spy.calls[0][0] === 'arg1' && spy.calls[1][0] === 'arg2'
    },
    expect: true,
    info: 'mock.fn tracks call arguments',
  },
  {
    fn: () => {
      const spy = fn(() => 'result')
      const result = spy()
      return result === 'result'
    },
    expect: true,
    info: 'mock.fn uses implementation function',
  },
  {
    fn: () => {
      const spy = fn().mockReturnValue('mocked')
      return spy() === 'mocked'
    },
    expect: true,
    info: 'mock.fn.mockReturnValue sets return value',
  },
  {
    fn: () => {
      const spy = fn().mockReturnValue('first')
      spy()
      spy.mockReturnValue('second')
      return spy() === 'second'
    },
    expect: true,
    info: 'mock.fn.mockReturnValue is chainable and updates value',
  },
  {
    fn: () => {
      const spy = fn()
      spy()
      spy()
      return spy.returns.length === 2
    },
    expect: true,
    info: 'mock.fn tracks return values',
  },
  {
    fn: async () => {
      const spy = fn().mockThrow(new Error('test error'))
      const caught = (await tryCatch(spy)()) as Error
      return caught instanceof Error && caught.message === 'test error'
    },
    expect: true,
    info: 'mock.fn.mockThrow throws configured error',
  },
  {
    fn: () => {
      const spy = fn()
      try {
        spy()
      } catch (e) {}
      return spy.errors.length === 1 && spy.errors[0] === null
    },
    expect: true,
    info: 'mock.fn tracks null for non-throwing calls',
  },
  {
    fn: () => {
      const spy = fn().mockThrow(new Error('fail'))
      try {
        spy()
      } catch (e) {}
      try {
        spy()
      } catch (e) {}
      return spy.errors.length === 2 && spy.errors[0]?.message === 'fail'
    },
    expect: true,
    info: 'mock.fn tracks errors for throwing calls',
  },
  {
    fn: () => {
      const obj = { greet: () => 'hello' }
      const spy = mock.spy(obj, 'greet', () => 'world')
      const result = obj.greet()
      return result === 'world'
    },
    expect: true,
    info: 'mock.spy replaces object method',
  },
  {
    fn: () => {
      const obj = { greet: () => 'original' }
      const spy = mock.spy(obj, 'greet', () => 'mocked')
      obj.greet()
      spy.mockRestore()
      return obj.greet() === 'original'
    },
    expect: true,
    info: 'mock.spy.mockRestore restores original method',
  },
  {
    fn: () => {
      const obj = { method: () => 'test' }
      const spy = mock.spy(obj, 'method')
      ;(obj.method as any)('arg1', 'arg2')
      return spy.calls.length === 1 && spy.calls[0]?.[0] === 'arg1' && spy.calls[0]?.[1] === 'arg2'
    },
    expect: true,
    info: 'mock.spy tracks arguments of spied method',
  },
  {
    fn: () => {
      const spy = fn()
      spy()
      spy()
      const calls = spy.getCalls()
      const returns = spy.getReturns()
      return (
        calls.length === 2 &&
        returns.length === 2 &&
        calls[0].length === 0 &&
        returns[0] === undefined
      )
    },
    expect: true,
    info: 'getCalls and getReturns return correct arrays',
  },
  {
    fn: () => {
      const spy = fn().mockReturnValue('value').mockReturnValue('value2')
      return spy._returnValue === 'value2'
    },
    expect: true,
    info: 'multiple mockReturnValue calls update value',
  },
  {
    fn: () => {
      const spy = fn()
      spy()
      spy()
      const errors = spy.getErrors()
      return errors.length === 2 && errors[0] === null
    },
    expect: true,
    info: 'getErrors returns correct array',
  },
]
