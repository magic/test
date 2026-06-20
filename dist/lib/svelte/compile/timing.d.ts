export declare const enableTracing: () => void
export declare const disableTracing: () => void
export declare const isTracingEnabled: () => boolean
export declare const traceStart: (name: string) => string
export declare const traceEnd: (id: string, details?: string) => number | undefined
export declare const traceAsync: <T>(
  name: string,
  fn: () => Promise<T>,
  details?: string,
) => Promise<T>
export declare const printTraceSummary: () => void
export declare const isTraceEnabled: () => boolean
export declare const resetTraces: () => void
export declare const getTraceData: () => {
  name: string
  start: number
  end?: number
  duration?: number
  id: string
}[]
export declare const getTraceSummary: () => {
  avg: number
  total: number
  count: number
  min: number
  max: number
  name: string
}[]
