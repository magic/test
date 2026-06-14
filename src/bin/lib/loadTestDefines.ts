import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'

const DEFINE_FILE_NAMES = ['.defines.mjs', '.defines.ts', 'defines.mjs', 'defines.ts'].map(
  f => `test/${f}`,
)

export const loadTestDefines = async (rootDir: string): Promise<Record<string, unknown>> => {
  for (const relPath of DEFINE_FILE_NAMES) {
    const filePath = path.join(rootDir, relPath)
    if (await fs.exists(filePath)) {
      try {
        const mod = await import(pathToFileURL(filePath).href)

        if (mod.default && typeof mod.default === 'object') {
          return mod.default as Record<string, unknown>
        }

        if (mod.define && typeof mod.define === 'object') {
          return mod.define as Record<string, unknown>
        }

        return {}
      } catch (e) {
        console.warn(`[test-defines] Failed to load ${relPath}:`, e)
        return {}
      }
    }
  }

  return {}
}
