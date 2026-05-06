import os from 'node:os'
export const getEffectiveWorkerLimit = override => {
  if (override !== undefined) {
    return Math.max(1, override)
  }
  const envLimit = process.env.MAGIC_TEST_WORKERS
  if (envLimit) {
    const parsed = parseInt(envLimit, 10)
    if (!isNaN(parsed)) {
      return Math.max(1, parsed)
    }
  }
  return Math.max(1, os.availableParallelism() - 2)
}
