export { compileSvelte } from './compileSvelte.js'
export { compileSvelteWithWrite } from './compileSvelteWithWrite.js'
// Cache manager for centralized caching
export { CacheManager, cacheManager } from './cache.js'
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
} from './timing.js'
