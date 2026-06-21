// Parallel execution with concurrency limit
export const MAX_CONCURRENT = 5
export async function parallelMap(items, fn, concurrency = MAX_CONCURRENT) {
  const results = new Array(items.length)
  const executing = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
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
