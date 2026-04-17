import log from '@magic/log'
/**
 * Get the duration since the stored start time
 */
export const getDuration = storeObj => {
  const startTime = storeObj.get('startTime')
  if (!startTime || !Array.isArray(startTime) || startTime.length !== 2) {
    return ''
  }
  return log.timeTaken(startTime, { log: false })
}
