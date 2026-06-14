import path from 'node:path'
import is from '@magic/types'

import { getViteDefine } from '../../lib/svelte/viteConfig/index.ts'
import { loadTestDefines } from '../../bin/lib/loadTestDefines.ts'

export const importFileInWorker = async (filePath: string): Promise<unknown> => {
  try {
    const rootDir = process.cwd()
    const defines = {
      ...(await getViteDefine(filePath)),
      ...(await loadTestDefines(rootDir)),
    }
    for (const [key, value] of Object.entries(defines)) {
      // @ts-expect-error - dynamic globalThis property assignment
      globalThis[key] = value
    }

    const mod = await import(filePath)
    if (mod && mod.default) {
      return mod.default
    }
    return mod
  } catch (err) {
    const error = is.error(err) ? err : new Error(String(err))
    error.message = `Failed to import test file: ${filePath}\n${error.message}`
    throw error
  }
}
