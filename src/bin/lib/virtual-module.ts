import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

/**
 * Empty module used as a fallback for `virtual:` scheme imports.
 * Vite/paraglide generate virtual modules via `virtual:paraglide/<hash>/...`;
 * the Node ESM loader cannot resolve those URLs, so we serve this placeholder.
 */
export const handleVirtualModule = async (
  _specifier: string,
): Promise<{ url: string; shortCircuit: boolean }> => {
  const emptyModulePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'empty-module.js')
  const modUrl = pathToFileURL(emptyModulePath).href
  return { url: modUrl, shortCircuit: true }
}
