import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'
import is from '@magic/types'

const DEFINE_FILE_NAMES = ['.defines.mjs', '.defines.ts', 'defines.mjs', 'defines.ts'].map(
  f => `test/${f}`,
)

export const loadTestDefines = async (rootDir: string): Promise<Record<string, unknown>> => {
  for (const relPath of DEFINE_FILE_NAMES) {
    const filePath = path.join(rootDir, relPath)
    if (await fs.exists(filePath)) {
      try {
        const mod = await import(pathToFileURL(filePath).href)

        if (mod.default && is.objectNative(mod.default)) {
          return mod.default
        }

        if (mod.define && is.objectNative(mod.define)) {
          return mod.define
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
