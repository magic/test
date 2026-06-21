export declare const enableTracing: () => void
export declare const disableTracing: () => void
export declare const isTracingEnabled: () => boolean
export declare const resetTraces: () => void
export declare const traceStart: (name: string) => string
export declare const traceEnd: (id: string, details?: string) => number | undefined
export declare const traceAsync: <T>(
  name: string,
  fn: () => Promise<T>,
  details?: string,
) => Promise<T>
export declare const printTraceSummary: () => void
export declare const isTraceEnabled: () => boolean
export declare const getTraceSummary: () => {
  name: string
  component: string | undefined
  duration: number | undefined
  details: string | undefined
  cached: boolean | undefined
  cacheSource: string | undefined
}[]
export declare const getTraceData: () => {
  name: string
  component: string | undefined
  duration: number | undefined
  details: string | undefined
  cached: boolean | undefined
  cacheSource: string | undefined
}[]
