type PromiseResult<T> = {
  status: 'fulfilled' | 'rejected'
  value?: T
  reason?: unknown
}

export const limitedPromiseAllSettled = async <T>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<unknown>,
): Promise<PromiseResult<T>[]> => {
  const results: PromiseResult<T>[] = []
  const running: Promise<void>[] = []

  const processItem = async (item: T, index: number): Promise<void> => {
    try {
      // Add 10 second timeout per item to prevent indefinite hangs
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Task timeout for: ${item}`)), 10000)
      })
      const value = await Promise.race([fn(item, index), timeoutPromise])
      results[index]! = { status: 'fulfilled', value: value as T }
    } catch (reason) {
      results[index]! = { status: 'rejected', reason }
    }
  }

  let index = 0
  const consume = (): void => {
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

  while (running.length > 0) {
    await Promise.race(running)
    consume()
  }
  return results
}
