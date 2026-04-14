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
      const value = await fn(item, index)
      results[index] = { status: 'fulfilled', value: value as T }
    } catch (reason) {
      results[index] = { status: 'rejected', reason }
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

  await Promise.all(running)
  return results
}
