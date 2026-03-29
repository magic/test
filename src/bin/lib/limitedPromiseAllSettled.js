/**
 * @template T
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T) => Promise<unknown>} fn
 * @returns {Promise<Array<{status: 'fulfilled' | 'rejected', value?: unknown, reason?: unknown}>>}
 */
export const limitedPromiseAllSettled = async (items, limit, fn) => {
  /** @type {Array<{status: 'fulfilled' | 'rejected', value?: unknown, reason?: unknown}>} */
  const results = []
  /** @type {Promise<void>[]} */
  const running = []

  /**
   * @param {T} item
   * @param {number} index
   */
  const processItem = async (item, index) => {
    try {
      const value = await fn(item)
      results[index] = { status: 'fulfilled', value }
    } catch (/** @type {unknown} */ reason) {
      results[index] = { status: 'rejected', reason }
    }
  }

  /** @type {number} */
  let index = 0
  const consume = () => {
    while (running.length < limit && index < items.length) {
      const currentIndex = index++
      const p = processItem(items[currentIndex], currentIndex).then(() => {
        running.splice(running.indexOf(p), 1)
        consume()
      })
      running.push(p)
    }
  }

  consume()

  await Promise.all(running)
  return results
}
