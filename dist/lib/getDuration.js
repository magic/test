import log from '@magic/log'
import is from '@magic/types'
/**
 * Get the duration since the stored start time
 * @param storeObj - The store object containing start times
 * @param timeKey - Which time to use: 'globalStartTime' (total time) or 'startTime' (test execution only)
 */
export const getDuration = (storeObj, timeKey = 'startTime') => {
  // Prefer globalStartTime if requested and available
  if (timeKey === 'globalStartTime') {
    const globalStartTime = storeObj.get('globalStartTime')
    if (globalStartTime && is.array(globalStartTime) && globalStartTime.length === 2) {
      return log.timeTaken(globalStartTime, { log: false })
    }
  }
  const startTime = storeObj.get('startTime')
  if (!startTime || !is.array(startTime) || startTime.length !== 2) {
    return ''
  }
  return log.timeTaken(startTime, { log: false })
}
//# sourceMappingURL=getDuration.js.map
