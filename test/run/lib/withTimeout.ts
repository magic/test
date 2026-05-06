import { withTimeout } from '../../../src/run/lib/withTimeout.js'
import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: async () => {
      const promise = new Promise(r => setTimeout(() => r('success'), 10))
      return withTimeout(promise, 100, 'test-key')
    },
    expect: 'success',
    info: 'resolves when promise completes within timeout',
  },
  {
    fn: async () => {
      let timedOut = false
      try {
        await withTimeout(
          new Promise((_, reject) => setTimeout(() => reject(new Error('delayed')), 20)),
          10,
          'test-key',
        )
      } catch (e) {
        timedOut = (e as Error).message.includes('timed out')
      }
      return timedOut
    },
    expect: true,
    info: 'rejects when promise rejects within timeout',
  },
  {
    fn: async () => {
      const promise = Promise.resolve('immediate')
      return withTimeout(promise, 0, 'test-key')
    },
    expect: 'immediate',
    info: 'returns immediately when timeout is 0',
  },
  {
    fn: async () => {
      const promise = Promise.resolve('immediate')
      return withTimeout(promise, -100, 'test-key')
    },
    expect: 'immediate',
    info: 'returns immediately when timeout is negative',
  },
  {
    fn: async () => {
      let rejected = false
      try {
        await withTimeout(Promise.reject(new Error('fail')), 100, 'test-key')
      } catch {
        rejected = true
      }
      return rejected
    },
    expect: true,
    info: 'propagates rejection when no timeout',
  },
] satisfies TestCase[]
