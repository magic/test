export { compileSvelte } from './compileSvelte.ts'
export { compileSvelteWithWrite } from './compileSvelteWithWrite.ts'

// Cache manager for centralized caching
export { CacheManager, cacheManager } from './cache.ts'

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
} from './timing.ts'
