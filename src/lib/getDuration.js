import log from '@magic/log'

import { store } from './store.js'

export const getDuration = () => {
  const startTime = store.get('startTime')
  return log.timeTaken(startTime, { log: false })
}
