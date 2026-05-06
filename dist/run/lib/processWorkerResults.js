import log from '@magic/log'
export const processWorkerResults = (results, rawResults, logger = log.warn) => {
  for (const r of results) {
    rawResults.push(r)
    if (r.afterCleanupError) {
      logger('afterCleanup error in', r.name, r.afterCleanupError)
    }
    if (r.afterError) {
      logger('after error in', r.name, r.afterError)
    }
  }
  return results
}
