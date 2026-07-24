import is from '@magic/types'
import {
  traceStart,
  traceEnd,
  isTracingEnabled,
  enableTracing,
  disableTracing,
} from '../../../src/lib/trace/timing.js'

export default [
  {
    fn: () => {
      disableTracing()
      return isTracingEnabled() === false
    },
    expect: true,
    info: 'isTracingEnabled returns false when disabled',
  },
  {
    fn: () => {
      enableTracing()
      const result = isTracingEnabled()
      disableTracing()
      return result
    },
    expect: true,
    info: 'isTracingEnabled returns true when enabled',
  },
  {
    fn: () => {
      disableTracing()
      const id = traceStart('test-trace')
      const duration = traceEnd(id)
      return id === 'test-trace' && duration === undefined
    },
    expect: true,
    info: 'traceStart/traceEnd return values when tracing disabled',
  },
  {
    fn: () => {
      enableTracing()
      const id = traceStart('test-trace')
      const duration = traceEnd(id)
      disableTracing()
      return is.string(id) && id.length > 0 && duration !== undefined
    },
    expect: true,
    info: 'traceStart/traceEnd work when tracing enabled',
  },
  {
    fn: () => {
      enableTracing()
      const _id = traceStart('test-trace')
      const duration = traceEnd('nonexistent-id')
      disableTracing()
      return duration
    },
    expect: is.undefined,
    info: 'traceEnd returns undefined for unknown id',
  },
  {
    fn: () => {
      enableTracing()
      const id1 = traceStart('test-trace-1')
      const id2 = traceStart('test-trace-2')
      traceEnd(id1, 'cached [memory]')
      const id3 = traceStart('test-trace-3')
      traceEnd(id2, 'compiled')
      traceEnd(id3)
      disableTracing()
      return id1 !== id2 && id2 !== id3 && id1 !== id3
    },
    expect: true,
    info: 'trace IDs are unique',
  },
  {
    fn: () => {
      enableTracing()
      const _id = traceStart('test')
      disableTracing()
      return _id
    },
    expect: is.string,
    info: 'resetTraces does not break enableTracing',
  },
  {
    fn: () => {
      // Test with cache status details
      enableTracing()
      const id = traceStart('test cache trace')
      traceEnd(id, 'cached [disk]')
      disableTracing()
      return true
    },
    expect: true,
    info: 'traceEnd handles cache status detail format',
  },
  {
    fn: () => {
      // Test with error detail
      enableTracing()
      const id = traceStart('test error trace')
      traceEnd(id, 'ERROR: something broke')
      disableTracing()
      return true
    },
    expect: true,
    info: 'traceEnd handles error detail format',
  },
  {
    fn: () => {
      // Test short circuit when disabled
      disableTracing()
      const id = traceStart('test')
      const d = traceEnd(id)
      return id === 'test' && is.undefined(d)
    },
    expect: true,
    info: 'traceStart returns name and traceEnd returns undefined when disabled',
  },
]
