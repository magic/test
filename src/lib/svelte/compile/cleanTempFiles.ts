import path from 'node:path'

import fs from '@magic/fs'

import { SourceMap } from 'magic-string'

import { TMP_DIR } from './constants.ts'

export let cleanupDone = false

export const cleanTempFiles = async (): Promise<void> => {
  if (cleanupDone) {
    return
  }

  cleanupDone = true

  try {
    const tmpDir = path.join(process.cwd(), TMP_DIR)
    const exists = await fs.exists(tmpDir)
    if (!exists) {
      return
    }

    const files = await fs.readdir(tmpDir)
    const now = Date.now()
    const MAX_AGE = 24 * 60 * 60 * 1000

    for (const file of files) {
      const filePath = path.join(tmpDir, file)
      try {
        const stat = await fs.stat(filePath)
        if (now - stat.mtimeMs > MAX_AGE) {
          fs.rmrf(filePath)
        }
      } catch {
        // Ignore errors for individual files
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}
