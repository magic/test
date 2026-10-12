import is from '@magic/types'

import { initDOM } from '../../lib/dom/index.js'
import { getViteDefine } from '../../lib/svelte/viteConfig/index.js'
import { loadTestDefines } from '../../bin/lib/loadTestDefines.js'

export const importFileInWorker = async (filePath: string): Promise<unknown> => {
  try {
    const rootDir = process.cwd()
    const defines = {
      ...(await getViteDefine(filePath)),
      ...(await loadTestDefines(rootDir)),
    }
    for (const [key, value] of Object.entries(defines)) {
      // @ts-expect-error - dynamic globalThis property assignment
      globalThis[key] = typeof value === 'string' ? JSON.parse(value) : value
    }

    // Ensure DOM globals exist in this worker before importing the test
    // file: files that only type-import @magic/test never trigger the index
    // module's initDOM() call. initGlobals is idempotent.
    initDOM()

    const mod = await import(filePath)
    if (mod && mod.default) {
      return mod.default
    }
    return mod
  } catch (err) {
    // Node caches failed ESM evaluations: several test files importing the
    // same broken module reject with the SAME Error instance. Wrap instead of
    // mutating so each file's message stays independent.
    const original = is.error(err) ? err : new Error(String(err))
    const error = new Error(`Failed to import test file: ${filePath}\n${original.message}`)
    if (is.ownProp(original, 'code')) {
      ;(error as { code?: string }).code = (original as { code?: string }).code
    }
    error.cause = original
    throw error
  }
}
