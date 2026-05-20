import path from 'node:path'
import fs from '@magic/fs'
import { TMP_DIR, CWD } from '../../../constants.js'
export let cleanupDone = false
export const cleanTempFiles = async () => {
  if (cleanupDone) {
    return
  }
  cleanupDone = true
  try {
    const tmpDir = path.join(CWD, TMP_DIR)
    const exists = await fs.exists(tmpDir)
    if (!exists) {
      return
    }
    const files = await fs.readdir(tmpDir)
    const now = Date.now()
    const MAX_AGE = 24 * 60 * 60 * 1000
    const deletePromises = []
    for (const file of files) {
      const filePath = path.join(tmpDir, file)
      try {
        const stat = await fs.stat(filePath)
        if (now - stat.mtimeMs > MAX_AGE) {
          deletePromises.push(fs.rmrf(filePath))
        }
      } catch {
        // Ignore errors for individual files
      }
    }
    await Promise.all(deletePromises)
  } catch {
    // Ignore cleanup errors
  }
}
