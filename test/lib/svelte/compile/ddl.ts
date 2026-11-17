import {
  ddl,
  ddlClearWatchdog,
  ddlHold,
  ddlRelease,
  ddlInitWatchdog,
} from '#lib/svelte/compile/ddl.js'
import os from 'node:os'
import type { TestCase } from '#src/types.js'

// The ddl helpers only act when MAGIC_TEST_DDL is set, and they write through
// process._rawDebug and a shared globalThis.__DDL map. Tests in one file run in
// parallel and share the process (env + _rawDebug) and globalThis, so each test
// must set its own state defensively and never delete the shared __DDL object
// (only its own keys), otherwise a sibling test's teardown wipes another
// test's entries mid-flight.
//
// Cross-suite hazard: the 5s watchdog holds globalThis.__DDL while other
// isolated main-thread tests run their snapshot/restore cycles. __DDL is in
// the isolation skipProps list, so a sibling restore can no longer delete it
// mid-test (the rare "waiting: false" flake). Covered by the "restore does
// not delete a __DDL created after the snapshot" test in test/run/isolation.ts.
type ProcWithDebug = { _rawDebug: unknown }
const proc = process as unknown as ProcWithDebug

const withEnv = async <T>(
  fn: (capture: string[], stub: (m: string) => void) => Promise<T>,
): Promise<T> => {
  const savedEnv = process.env.MAGIC_TEST_DDL
  const savedDebug = proc._rawDebug
  const capture: string[] = []
  const stub = (m: string) => {
    capture.push(String(m))
  }
  process.env.MAGIC_TEST_DDL = '1'
  proc._rawDebug = stub
  try {
    return await fn(capture, stub)
  } finally {
    if (savedEnv === undefined) {
      delete process.env.MAGIC_TEST_DDL
    } else {
      process.env.MAGIC_TEST_DDL = savedEnv
    }
    proc._rawDebug = savedDebug
  }
}

const dropKey = (key: string) => {
  const g = globalThis as { __DDL?: { map: Map<string, string[]> } }
  g.__DDL?.map.delete(key)
}

export default [
  {
    fn: () => withEnv(async capture => ddl('hello') ?? capture),
    expect: ['[DDL] hello'],
    info: 'ddl writes a prefixed message via _rawDebug when MAGIC_TEST_DDL is set',
  },
  {
    fn: () =>
      withEnv(async () => {
        const saved = process.env.MAGIC_TEST_DDL
        delete process.env.MAGIC_TEST_DDL
        const debug = proc._rawDebug
        proc._rawDebug = () => {
          throw new Error('should not be called')
        }
        try {
          ddl('silent')
          return 'no-throw'
        } finally {
          proc._rawDebug = debug
          process.env.MAGIC_TEST_DDL = saved
        }
      }),
    expect: 'no-throw',
    info: 'ddl is a no-op when MAGIC_TEST_DDL is unset',
  },
  {
    fn: () =>
      withEnv(async () => {
        ddlHold('holdA', 'w1')
        ddlHold('holdA', 'w2')
        ddlHold('holdB', 'w3')
        try {
          const map = (globalThis as { __DDL?: { map: Map<string, string[]> } }).__DDL?.map
          return { a: map?.get('holdA'), b: map?.get('holdB') }
        } finally {
          dropKey('holdA')
          dropKey('holdB')
        }
      }),
    expect: { a: ['w1', 'w2'], b: ['w3'] },
    info: 'ddlHold accumulates waiters per key on the process DDL map',
  },
  {
    fn: () =>
      withEnv(async () => {
        ddlHold('relA', 'w1')
        ddlHold('relA', 'w2')
        try {
          const map = (globalThis as { __DDL?: { map: Map<string, string[]> } }).__DDL?.map
          ddlRelease('relA', 'w1')
          const remaining = map?.get('relA')
          ddlRelease('relA', 'w2')
          return { remaining, keyRemovedAfterLastRelease: !(map?.has('relA') ?? true) }
        } finally {
          dropKey('relA')
        }
      }),
    expect: { remaining: ['w2'], keyRemovedAfterLastRelease: true },
    info: 'ddlRelease removes a waiter and drops the key once empty',
  },
  {
    fn: () => withEnv(async () => (ddlRelease('missing', 'w'), 'no-throw')),
    expect: 'no-throw',
    info: 'ddlRelease tolerates unknown keys',
  },
  {
    fn: () =>
      withEnv(async () => {
        const saved = process.env.MAGIC_TEST_DDL
        delete process.env.MAGIC_TEST_DDL
        try {
          ddlHold('noop', 'y')
          ddlInitWatchdog()
          return 'no-throw'
        } finally {
          process.env.MAGIC_TEST_DDL = saved
          dropKey('noop')
        }
      }),
    expect: 'no-throw',
    info: 'ddlInitWatchdog does nothing when MAGIC_TEST_DDL is unset',
  },
  {
    fn: () =>
      withEnv(async (capture, stub) => {
        ddlHold('stuck', 'holder')
        ddlInitWatchdog()
        // Wait for the dump with a deadline far beyond one 5s interval. The
        // interval is unref'd, so a tick whose deadline expires while the main
        // thread is blocked by other parallel suites (coverage runs starve it
        // for seconds at a time) only runs when the loop next turns — a rigid
        // 5.6s window lapsed before the overdue tick could fire and the test
        // failed. A single tick can also be lost if a sibling restores
        // _rawDebug at its exact instant; the next interval retries it. On a
        // busy machine siblings (and the whole run) run many times longer,
        // so the deadline scales with the load. A genuinely broken watchdog
        // still fails via the runner's per-test timeout.
        const scale = (os.loadavg()[0] ?? 0) > os.availableParallelism() / 2 ? 12 : 1
        const start = Date.now()
        while (Date.now() - start < 25_000 * scale) {
          if (
            capture.some(m => m.includes('[DDL-hb]')) &&
            capture.some(m => m.includes('stuck <- holder'))
          ) {
            break
          }
          // Parallel sibling tests restore env/_rawDebug as they finish, so
          // re-assert ours every tick. No test deletes the __DDL object, so the
          // held key survives to the 5s interval.
          process.env.MAGIC_TEST_DDL = '1'
          proc._rawDebug = stub
          ddlHold('stuck', 'holder')
          await new Promise(r => setTimeout(r, 200))
        }
        try {
          return {
            heartbeat: capture.some(m => m.includes('[DDL-hb]')),
            waiting: capture.some(m => m.includes('stuck <- holder')),
          }
        } finally {
          ddlClearWatchdog()
          dropKey('stuck')
        }
      }),
    expect: { heartbeat: true, waiting: true },
    info: 'ddlInitWatchdog dumps pending waits on the 5s watchdog interval',
  },
] satisfies TestCase[]
