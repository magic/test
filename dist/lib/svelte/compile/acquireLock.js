// Queue of release functions per file path
const lockQueues = new Map()
export const acquireLock = async filePath => {
  const waiters = lockQueues.get(filePath)
  if (waiters && waiters.length > 0) {
    // Another request is holding the lock, queue behind it
    await new Promise(resolve => {
      waiters.push(resolve)
    })
  }
  // We now hold the lock (or are first)
  // Ensure we have a queue for this file
  const queue = lockQueues.get(filePath) ?? []
  lockQueues.set(filePath, queue)
  return () => {
    const q = lockQueues.get(filePath)
    const next = q?.shift()
    if (next) {
      // Signal next waiter to proceed
      next()
    } else {
      // No more waiters, clean up
      lockQueues.delete(filePath)
    }
  }
}
