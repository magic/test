import log from '@magic/log'
import is from '@magic/types'
/**
 * Get the duration since the stored start time
 */
export const getDuration = storeObj => {
  const startTime = storeObj.get('startTime')
  if (!startTime || !is.array(startTime) || startTime.length !== 2) {
    return ''
  }
  return log.timeTaken(startTime, { log: false })
}
