var __rewriteRelativeImportExtension =
  (this && this.__rewriteRelativeImportExtension) ||
  function (path, preserveJsx) {
    if (typeof path === 'string' && /^\.\.?\//.test(path)) {
      return path.replace(
        /\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,
        function (m, tsx, d, ext, cm) {
          return tsx
            ? preserveJsx
              ? '.jsx'
              : '.js'
            : d && (!ext || !cm)
              ? m
              : d + ext + '.' + cm.toLowerCase() + 'js'
        },
      )
    }
    return path
  }
import is from '@magic/types'
import { initDOM } from '../../lib/dom/index.js'
import { getViteDefine } from '../../lib/svelte/viteConfig/index.js'
import { loadTestDefines } from '../../bin/lib/loadTestDefines.js'
/**
 * Vite define values may be pre-stringified JSON (e.g. '"my url"') or raw
 * literals (e.g. a bare 'http://localhost:9000'). Parse JSON when possible,
 * otherwise keep the raw string so a non-JSON define does not crash the
 * whole import.
 */
const parseDefineValue = value => {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
export const importFileInWorker = async filePath => {
  try {
    const rootDir = process.cwd()
    const defines = {
      ...(await getViteDefine(filePath)),
      ...(await loadTestDefines(rootDir)),
    }
    for (const [key, value] of Object.entries(defines)) {
      // @ts-expect-error - dynamic globalThis property assignment
      globalThis[key] = typeof value === 'string' ? parseDefineValue(value) : value
    }
    // Ensure DOM globals exist in this worker before importing the test
    // file: files that only type-import @magic/test never trigger the index
    // module's initDOM() call. initGlobals is idempotent.
    initDOM()
    const mod = await import(__rewriteRelativeImportExtension(filePath))
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
      error.code = original.code
    }
    error.cause = original
    throw error
  }
}
//# sourceMappingURL=importFileInWorker.js.map
