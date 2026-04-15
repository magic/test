export const limitedPromiseAllSettled = async (items, limit, fn) => {
  const results = []
  const running = []
  const processItem = async (item, index) => {
    try {
      const value = await fn(item, index)
      results[index] = { status: 'fulfilled', value: value }
    } catch (reason) {
      results[index] = { status: 'rejected', reason }
    }
  }
  let index = 0
  const consume = () => {
    while (running.length < limit && index < items.length) {
      const currentIndex = index++
      const item = items[currentIndex]
      if (item) {
        const p = processItem(item, currentIndex).then(() => {
          running.splice(running.indexOf(p), 1)
          consume()
        })
        running.push(p)
      }
    }
  }
  consume()
  await Promise.all(running)
  return results
}
