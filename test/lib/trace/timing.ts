import {
  enableTracing,
  disableTracing,
  isTracingEnabled,
  resetTraces,
  traceStart,
  traceEnd,
  traceAsync,
  printTraceSummary,
  getTraceSummary,
  getTraceData,
} from '#lib/trace/timing.js'
import { has } from '#lib/has.js'
import is from '@magic/types'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // tracing disabled by default (unless TEST_TRACE=1)
  {
    fn: () => {
      disableTracing()
      return isTracingEnabled()
    },
    expect: false,
    info: 'disableTracing turns tracing off',
  },
  // enableTracing
  {
    fn: () => {
      enableTracing()
      const wasEnabled = isTracingEnabled()
      disableTracing()
      return wasEnabled
    },
    expect: true,
    info: 'enableTracing turns tracing on',
  },
  // traceStart returns name when disabled
  {
    fn: () => {
      disableTracing()
      return traceStart('op')
    },
    expect: 'op',
    info: 'traceStart returns name when disabled',
  },
  // traceStart returns id when enabled
  {
    fn: () => {
      enableTracing()
      const id = traceStart('op2')
      disableTracing()
      return id
    },
    expect: (v: unknown) => is.string(v) && v.length > 0 && v !== 'op2',
    info: 'traceStart returns unique id when enabled',
  },
  // traceEnd returns undefined when disabled
  {
    fn: () => {
      disableTracing()
      return traceEnd('some-id')
    },
    expect: undefined,
    info: 'traceEnd returns undefined when disabled',
  },
  // traceEnd returns undefined for unknown id
  {
    fn: () => {
      enableTracing()
      const result = traceEnd('nonexistent-id')
      disableTracing()
      return result
    },
    expect: undefined,
    info: 'traceEnd returns undefined for unknown id',
  },
  // traceStart + traceEnd round trip returns duration
  {
    fn: () => {
      enableTracing()
      const id = traceStart('roundtrip')
      const duration = traceEnd(id, 'compiled')
      disableTracing()
      return duration
    },
    expect: [is.num, (v: number) => v >= 0],
    info: 'traceStart/traceEnd round trip returns duration',
  },
  // traceEnd with cache hit details
  {
    fn: () => {
      enableTracing()
      const id = traceStart('cache-test')
      const duration = traceEnd(id, 'cache hit')
      disableTracing()
      return duration
    },
    expect: is.num,
    info: 'traceEnd handles cache hit details',
  },
  // traceEnd with cached [memory] details
  {
    fn: () => {
      enableTracing()
      const id = traceStart('cache-test2')
      const duration = traceEnd(id, 'cached [disk]')
      disableTracing()
      return duration
    },
    expect: is.num,
    info: 'traceEnd handles cached [disk] details',
  },
  // traceAsync success
  {
    fn: async () => {
      enableTracing()
      const result = await traceAsync('async-op', async () => 'value', 'compiled')
      disableTracing()
      return result
    },
    expect: 'value',
    info: 'traceAsync returns fn result',
  },
  // traceAsync error propagation
  {
    fn: async () => {
      enableTracing()
      let msg = ''
      try {
        await traceAsync('async-err', async () => {
          throw new Error('async fail')
        })
      } catch (e) {
        msg = (e as Error).message
      }
      disableTracing()
      return msg
    },
    expect: 'async fail',
    info: 'traceAsync propagates errors',
  },
  // getTraceSummary returns entries
  {
    fn: () => {
      enableTracing()
      const id = traceStart('summary-op Counter.svelte')
      traceEnd(id, 'compiled')
      const summary = getTraceSummary()
      resetTraces()
      disableTracing()
      return summary
    },
    expect: (s: { name?: string; component?: string }[]) =>
      s.some(e => e.name === 'summary-op Counter.svelte' && e.component === 'Counter.svelte'),
    info: 'getTraceSummary includes entries with component extraction',
  },
  // getTraceSummary extracts component from filename
  {
    fn: () => {
      enableTracing()
      const id1 = traceStart('compileSvelteWithWrite Card.svelte')
      traceEnd(id1)
      const id2 = traceStart('plain-op')
      traceEnd(id2)
      const summary = getTraceSummary()
      const card = summary.find(
        (e: { name?: string }) => e.name === 'compileSvelteWithWrite Card.svelte',
      )
      const plain = summary.find((e: { name?: string }) => e.name === 'plain-op')
      resetTraces()
      disableTracing()
      return { card: card?.component, plain: plain?.component }
    },
    expect: has.properties({ card: 'Card.svelte', plain: undefined }),
    info: 'component extracted only for filename-like last segment',
  },
  // getTraceData is alias of getTraceSummary
  {
    fn: () => {
      enableTracing()
      const id = traceStart('alias-op')
      traceEnd(id)
      const a = getTraceSummary()
      const b = getTraceData()
      resetTraces()
      disableTracing()
      return { a, b }
    },
    expect: (v: { a: unknown; b: unknown[] }) => Array.isArray(v.a) && v.a.length === v.b.length,
    info: 'getTraceData matches getTraceSummary',
  },
  // resetTraces clears entries
  {
    fn: () => {
      enableTracing()
      const id = traceStart('to-clear')
      traceEnd(id)
      resetTraces()
      const summary = getTraceSummary()
      disableTracing()
      return summary
    },
    expect: [],
    info: 'resetTraces clears all trace entries',
  },
  // printTraceSummary with entries (smoke test)
  {
    fn: () => {
      enableTracing()
      for (let i = 0; i < 3; i++) {
        const id = traceStart(`opX File${i}.svelte`)
        traceEnd(id, i === 0 ? 'compiled' : 'cached [memory]')
      }
      let printed = false
      const origLog = console.log
      console.log = () => {
        printed = true
      }
      try {
        printTraceSummary()
      } finally {
        console.log = origLog
        resetTraces()
        disableTracing()
      }
      return printed
    },
    expect: true,
    info: 'printTraceSummary prints when enabled with entries',
  },
  // printTraceSummary no-op when disabled
  {
    fn: () => {
      disableTracing()
      let printed = false
      const origLog = console.log
      console.log = () => {
        printed = true
      }
      try {
        printTraceSummary()
      } finally {
        console.log = origLog
      }
      return printed
    },
    expect: false,
    info: 'printTraceSummary is a no-op when disabled',
  },
]

export default tests
