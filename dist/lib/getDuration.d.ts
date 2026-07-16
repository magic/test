/**
 * Get the duration since the stored start time
 * @param storeObj - The store object containing start times
 * @param timeKey - Which time to use: 'globalStartTime' (total time) or 'startTime' (test execution only)
 */
export declare const getDuration: (
  storeObj: {
    get: (key: string) => unknown
  },
  timeKey?: 'globalStartTime' | 'startTime',
) => string
