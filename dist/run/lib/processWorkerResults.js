import log from '@magic/log'
export const processWorkerResults = (results, rawResults) => {
  for (const r of results) {
    rawResults.push(r)
    if (r.afterCleanupError) {
      log.warn('afterCleanup error in', r.name, r.afterCleanupError)
    }
    if (r.afterError) {
      log.warn('after error in', r.name, r.afterError)
    }
  }
  return results
}
