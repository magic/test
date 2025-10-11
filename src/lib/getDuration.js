import log from '@magic/log'

import { store } from './store.js'
import is from '@magic/types'

/**
 * Get the duration since the stored start time
 * @returns {string} - Formatted duration string
 */
export const getDuration = () => {
  const startTime = store.get('startTime')

  if (!startTime) {
    return ''
  }

  return log.timeTaken(startTime, { log: false })
}
