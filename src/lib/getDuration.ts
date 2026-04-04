import log from '@magic/log'

/**
 * Get the duration since the stored start time
 */
export const getDuration = (storeObj: { get: (key: string) => unknown }): string => {
  const startTime = storeObj.get('startTime')

  if (!startTime || !Array.isArray(startTime) || startTime.length !== 2) {
    return ''
  }

  return log.timeTaken(startTime as [number, number], { log: false })
}
