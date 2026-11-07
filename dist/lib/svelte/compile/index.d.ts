export { compileSvelte } from './compileSvelte.js'
export { compileSvelteWithWrite } from './compileSvelteWithWrite.js'
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
} from '../../trace/timing.js'
