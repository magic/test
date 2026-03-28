import log from '@magic/log'

import is from '@magic/types'

/**
 * Get the duration since the stored start time
 * @param {{get: (key: string) => unknown}} storeObj - Store object with get method
 * @returns {string} - Formatted duration string
 */
export const getDuration = storeObj => {
  const startTime = storeObj.get('startTime')

  if (!startTime) {
    return ''
  }

  return log.timeTaken(/** @type {[number, number]} */ (startTime), { log: false })
}
