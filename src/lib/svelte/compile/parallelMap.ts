// Parallel execution with concurrency limit
export const MAX_CONCURRENT = 5

export async function parallelMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number = MAX_CONCURRENT,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  const executing: Promise<void>[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!
    const promise = fn(item, i).then(result => {
      results[i] = result
      executing.splice(executing.indexOf(promise), 1)
    })
    executing.push(promise)

    if (executing.length >= concurrency) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
  return results
}
