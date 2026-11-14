import { withTimeout } from '#src/run/lib/withTimeout.js'
import { has } from '#lib/has.js'
import type { TestCase } from '#src/types.js'

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
      // Deterministic version of the timer-race: reject the wrapped promise
      // only after the timeout has fired. Two competing setTimeouts under
      // load can settle on the same tick in creation order, which used to
      // let the promise's timer win and flake this test.
      let rejectPromise: (e: Error) => void
      const promise = new Promise<void>((_, reject) => {
        rejectPromise = reject
      })
      const race = withTimeout(promise, 5, 'test-key')
      // Await the race itself: the 5ms timeout must settle it. A fixed
      // 50ms wait instead is not deterministic — a synchronous main-thread
      // block (snapshot build, svelte compile) can delay the 5ms timer past
      // the wait, and the late rejection below would then win the race
      // spuriously. The rejection only ever runs AFTER the race settled, so
      // it can never win: either the timeout fired (pass) or the fn hangs
      // into the test timeout (a real bug).
      const raceMessage = race.catch(e => (e as Error).message)
      const settled = await raceMessage
      rejectPromise!(new Error('delayed'))
      return settled
    },
    expect: has.string('timed out'),
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
      try {
        await withTimeout(Promise.reject(new Error('fail')), 100, 'test-key')
      } catch (e) {
        return (e as Error).message
      }
      return ''
    },
    expect: has.string('fail'),
    info: 'propagates rejection when no timeout',
  },
] satisfies TestCase[]
