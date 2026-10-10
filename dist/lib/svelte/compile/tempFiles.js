/* ---------------------------------------------------------------------------
 * Temp-file layer for the Svelte compile pipeline.
 *
 * Transpiled/processed files are written next to the source tree under
 * CACHE_DIR (or a node_modules_processed mirror for dependencies) so Node
 * can import them as plain .mjs. Writes go through writeQueue and are
 * deduplicated via a pending-writes map.
 * -------------------------------------------------------------------------- */
import path from 'node:path'
import { writeQueue } from './writeQueue.js'
import { getCwd, CACHE_DIR } from '#src/constants.js'
const pendingWrites = new Map()
export const computeTempPath = filePath => {
  if (filePath.includes('node_modules')) {
    const relFromNodeModules = filePath.split('node_modules/').pop() || ''
    return path.join(getCwd(), CACHE_DIR, 'node_modules_processed', relFromNodeModules)
  }
  const relPath = path.relative(getCwd(), filePath)
  return path.join(getCwd(), CACHE_DIR, relPath + '.mjs')
}
export const writeTempFile = async (filePath, code) => {
  const tempFile = computeTempPath(filePath)
  // Check for existing pending write first
  const existing = pendingWrites.get(tempFile)
  if (existing) {
    await existing
    return tempFile
  }
  // Create promise synchronously before any await to prevent race condition
  const promise = (async () => {
    try {
      await writeQueue.write(tempFile, code)
      // Flush immediately to guarantee file exists before returning.
      // Without this, batched writes may not be flushed until batch is full or timeout.
      await writeQueue.flushPath(tempFile)
    } finally {
      pendingWrites.delete(tempFile)
    }
    return tempFile
  })()
  // Set in map immediately (before await) to catch concurrent callers
  pendingWrites.set(tempFile, promise)
  return promise
}
//# sourceMappingURL=tempFiles.js.map
