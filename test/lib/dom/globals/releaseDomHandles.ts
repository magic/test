import is from '@magic/types'
import {
  initGlobals,
  beginTimerScope,
  releaseDomHandles,
  trackedDomTimerCount,
} from '#lib/dom/globals.js'

// Each test uses its own `before: initGlobals` hook: that routes the test
// into a dedicated worker with a fresh globalThis (and therefore a fresh
// timer-state object), so the assertions below are deterministic.
export default [
  {
    before: initGlobals,
    fn: () => {
      const baseline = trackedDomTimerCount()
      const id = setTimeout(() => {}, 60_000)
      const scheduled = trackedDomTimerCount()
      clearTimeout(id)
      const afterClear = trackedDomTimerCount()
      return { baseline, scheduled, afterClear }
    },
    expect: (v: { baseline: number; scheduled: number; afterClear: number }) =>
      v.scheduled === v.baseline + 1 && v.afterClear === v.baseline,
    info: 'timers scheduled through the DOM global are tracked; clearTimeout untracks',
  },
  {
    before: initGlobals,
    fn: () => {
      let fired = false
      const scope = beginTimerScope()
      scope.run(() => {
        setTimeout(() => {
          fired = true
        }, 10)
      })
      const cleared = scope.end()
      return new Promise<{ fired: boolean; cleared: number }>(res =>
        setTimeout(() => res({ fired, cleared }), 50),
      )
    },
    expect: (v: { fired: boolean; cleared: number }) => v.cleared === 1 && !v.fired,
    info: 'a scope end clears its own timers — the leftover callback never fires',
  },
  {
    before: initGlobals,
    fn: () => {
      let aFired = false
      const a = beginTimerScope()
      const b = beginTimerScope()
      a.run(() => {
        setTimeout(() => {
          aFired = true
        }, 10)
      })
      b.run(() => {
        /* nothing scheduled here */
      })
      b.end()
      return new Promise<{ aFired: boolean }>(res => setTimeout(() => res({ aFired }), 50))
    },
    expect: (v: { aFired: boolean }) => v.aFired,
    info: "sibling scopes do not sweep each other's timers",
  },
  {
    before: initGlobals,
    fn: () => {
      const baseline = trackedDomTimerCount()
      const suite = beginTimerScope()
      const test = beginTimerScope()
      return suite.run(() => {
        // suite-level (beforeAll-style) interval
        setInterval(() => {}, 60_000)
        const afterSuiteTimer = trackedDomTimerCount()
        // test-level timeout, nested scope
        test.run(() => {
          setTimeout(() => {}, 60_000)
        })
        const afterTestTimer = trackedDomTimerCount()
        test.end()
        const afterTestEnd = trackedDomTimerCount()
        suite.end()
        const afterSuiteEnd = trackedDomTimerCount()
        return { baseline, afterSuiteTimer, afterTestTimer, afterTestEnd, afterSuiteEnd }
      })
    },
    expect: (v: {
      baseline: number
      afterSuiteTimer: number
      afterTestTimer: number
      afterTestEnd: number
      afterSuiteEnd: number
    }) =>
      v.afterSuiteTimer === v.baseline + 1 &&
      v.afterTestTimer === v.baseline + 2 &&
      v.afterTestEnd === v.baseline + 1 &&
      v.afterSuiteEnd === v.baseline,
    info: 'nested scopes attribute timers to the innermost; suite-level timers survive the test boundary and die with the suite',
  },
  {
    before: initGlobals,
    fn: () => {
      const before = trackedDomTimerCount()
      // zero-delay DOM timers return the window's Timeout wrapper (no unref);
      // scope end and the release sweep must not choke on non-node IDs
      const scope = beginTimerScope()
      scope.run(() => {
        setTimeout(() => {}, 0)
      })
      const scheduled = trackedDomTimerCount()
      scope.end()
      const released = releaseDomHandles()
      return { before, scheduled, released }
    },
    expect: (v: { before: number; scheduled: number; released: number }) =>
      v.scheduled === v.before + 1 && v.released >= 1,
    info: 'zero-delay wrapper IDs are tracked, swept and unref-safe',
  },
  {
    before: initGlobals,
    fn: () => {
      const id = setTimeout(() => {}, 60_000)
      let unrefCalled = false
      const originalUnref = (id as { unref?: () => unknown }).unref?.bind(id)
      ;(id as { unref?: () => unknown }).unref = () => {
        unrefCalled = true
        return originalUnref ? originalUnref() : id
      }
      const released = releaseDomHandles()
      return { released, unrefCalled, remaining: trackedDomTimerCount() }
    },
    expect: (v: { released: number; unrefCalled: boolean; remaining: number }) =>
      v.released >= 1 && v.unrefCalled && v.remaining === 0,
    info: 'releaseDomHandles (backstop) unrefs pending timers and clears the registry',
  },
  {
    before: initGlobals,
    fn: () => {
      const first = releaseDomHandles()
      const second = releaseDomHandles()
      return { first, second }
    },
    expect: (v: { first: number; second: number }) => v.first >= 0 && v.second === 0,
    info: 'releaseDomHandles is idempotent on an empty registry',
  },
]
