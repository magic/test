import { initGlobals } from '#lib/dom/globals.js'

const g = globalThis as Record<string, unknown>

// Both tests carry a `before` hook, so the runner batches them into ONE
// worker (shared globalThis, sequential execution). The first test schedules
// a fire-and-forget timer it never clears — the per-test timer scope must
// sweep it the moment that test ends, so the second test (running 50ms+
// later in the same worker) never observes it firing. This also pins the
// batch-worker non-interference property: a batched test's timers must not
// leak into the next test of the same worker.
export default [
  {
    before: initGlobals,
    name: 'leak a fire-and-forget timer (swept by the per-test scope)',
    fn: () => {
      g.__timer_sweep_flag = false
      setTimeout(() => {
        g.__timer_sweep_flag = true
      }, 50)
      return true
    },
    expect: true,
  },
  {
    before: initGlobals,
    name: 'the earlier batched test timer never fired',
    fn: () =>
      new Promise<boolean>(res =>
        setTimeout(() => {
          // The batch worker snapshot/restores between tests, so the flag
          // reads as undefined when untouched — assert "never fired", not
          // "still false".
          res(g.__timer_sweep_flag !== true)
        }, 150),
      ),
    expect: true,
  },
]
