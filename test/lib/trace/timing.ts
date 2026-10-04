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
} from '#src/lib/trace/timing.js'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // tracing disabled by default (unless TEST_TRACE=1)
  {
    fn: () => {
      disableTracing()
      return isTracingEnabled() === false
    },
    expect: true,
    info: 'disableTracing turns tracing off',
  },
  // enableTracing
  {
    fn: () => {
      enableTracing()
      const wasEnabled = isTracingEnabled()
      disableTracing()
      return wasEnabled === true
    },
    expect: true,
    info: 'enableTracing turns tracing on',
  },
  // traceStart returns name when disabled
  {
    fn: () => {
      disableTracing()
      return traceStart('op') === 'op'
    },
    expect: true,
    info: 'traceStart returns name when disabled',
  },
  // traceStart returns id when enabled
  {
    fn: () => {
      enableTracing()
      const id = traceStart('op2')
      disableTracing()
      return typeof id === 'string' && id.length > 0 && id !== 'op2'
    },
    expect: true,
    info: 'traceStart returns unique id when enabled',
  },
  // traceEnd returns undefined when disabled
  {
    fn: () => {
      disableTracing()
      return traceEnd('some-id') === undefined
    },
    expect: true,
    info: 'traceEnd returns undefined when disabled',
  },
  // traceEnd returns undefined for unknown id
  {
    fn: () => {
      enableTracing()
      const result = traceEnd('nonexistent-id')
      disableTracing()
      return result === undefined
    },
    expect: true,
    info: 'traceEnd returns undefined for unknown id',
  },
  // traceStart + traceEnd round trip returns duration
  {
    fn: () => {
      enableTracing()
      const id = traceStart('roundtrip')
      const duration = traceEnd(id, 'compiled')
      disableTracing()
      return typeof duration === 'number' && duration >= 0
    },
    expect: true,
    info: 'traceStart/traceEnd round trip returns duration',
  },
  // traceEnd with cache hit details
  {
    fn: () => {
      enableTracing()
      const id = traceStart('cache-test')
      const duration = traceEnd(id, 'cache hit')
      disableTracing()
      return typeof duration === 'number'
    },
    expect: true,
    info: 'traceEnd handles cache hit details',
  },
  // traceEnd with cached [memory] details
  {
    fn: () => {
      enableTracing()
      const id = traceStart('cache-test2')
      const duration = traceEnd(id, 'cached [disk]')
      disableTracing()
      return typeof duration === 'number'
    },
    expect: true,
    info: 'traceEnd handles cached [disk] details',
  },
  // traceAsync success
  {
    fn: async () => {
      enableTracing()
      const result = await traceAsync('async-op', async () => 'value', 'compiled')
      disableTracing()
      return result === 'value'
    },
    expect: true,
    info: 'traceAsync returns fn result',
  },
  // traceAsync error propagation
  {
    fn: async () => {
      enableTracing()
      let caught = false
      try {
        await traceAsync('async-err', async () => {
          throw new Error('async fail')
        })
      } catch (e) {
        caught = e instanceof Error && e.message === 'async fail'
      }
      disableTracing()
      return caught
    },
    expect: true,
    info: 'traceAsync propagates errors',
  },
  // getTraceSummary returns entries
  {
    fn: () => {
      enableTracing()
      const id = traceStart('summary-op Counter.svelte')
      traceEnd(id, 'compiled')
      const summary = getTraceSummary()
      const has = summary.some(
        (e: { name?: string; component?: string }) =>
          e.name === 'summary-op Counter.svelte' && e.component === 'Counter.svelte',
      )
      resetTraces()
      disableTracing()
      return has
    },
    expect: true,
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
      return card?.component === 'Card.svelte' && plain?.component === undefined
    },
    expect: true,
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
      return Array.isArray(a) && a.length === b.length
    },
    expect: true,
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
      return summary.length === 0
    },
    expect: true,
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
      return !printed
    },
    expect: true,
    info: 'printTraceSummary is a no-op when disabled',
  },
]

export default tests
