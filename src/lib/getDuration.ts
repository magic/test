import log from '@magic/log'
import is from '@magic/types'

/**
 * Get the duration since the stored start time
 */
export const getDuration = (storeObj: { get: (key: string) => unknown }): string => {
  const startTime = storeObj.get('startTime')

  if (!startTime || !is.array(startTime) || startTime.length !== 2) {
    return ''
  }

  return log.timeTaken(startTime as [number, number], { log: false })
}
