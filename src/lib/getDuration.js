import log from '@magic/log'

import store from './store.mjs'

export const getDuration = () => {
  const startTime = store.get('startTime')
  return log.timeTaken(startTime, { log: false })
}
