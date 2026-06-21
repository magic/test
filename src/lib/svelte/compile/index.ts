export { compileSvelte } from './compileSvelte.ts'
export { compileSvelteWithWrite } from './compileSvelteWithWrite.ts'

// Timing/tracing exports for performance profiling
export {
  traceStart,
  traceEnd,
  traceAsync,
  enableTracing,
  disableTracing,
  isTracingEnabled,
  isTraceEnabled,
  printTraceSummary,
  resetTraces,
  getTraceData,
  getTraceSummary,
} from '../../trace/timing.ts'
