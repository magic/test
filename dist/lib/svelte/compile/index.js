export { compileSvelte } from './compileSvelte.js'
export { compileSvelteWithWrite } from './compileSvelteWithWrite.js'
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
} from '#src/lib/trace/timing.js'
//# sourceMappingURL=index.js.map
