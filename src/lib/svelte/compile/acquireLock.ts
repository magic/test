import { fileLocks } from './cache.js'

export const acquireLock = async (filePath: string): Promise<() => void> => {
  while (fileLocks.has(filePath)) {
    const lockPromise = fileLocks.get(filePath)
    if (lockPromise) {
      await lockPromise
      fileLocks.delete(filePath)
    }
  }

  let release: (value: unknown) => void
  const promise = new Promise(resolve => {
    release = resolve
  })
  fileLocks.set(filePath, promise)

  return () => {
    fileLocks.delete(filePath)
    release(undefined)
  }
}
