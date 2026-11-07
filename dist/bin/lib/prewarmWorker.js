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
/**
 * Prewarm worker: imports a slice of component graphs.
 *
 * Spawned by prewarmComponents (main thread). The Svelte/TS loader is
 * registered process-wide by unit.js, so importing a .svelte URL here
 * compiles the whole module graph and records it in the shared disk cache
 * (manifest + compiled temp files) for the test workers to reuse.
 *
 * Prewarm is best-effort: import failures are reported, never fatal — the
 * real test (with a full DOM) will surface genuine errors.
 */
import { parentPort, workerData } from 'node:worker_threads'
const main = async () => {
  const urls = workerData.urls ?? []
  const results = []
  for (const url of urls) {
    try {
      await import(__rewriteRelativeImportExtension(url))
      results.push({ url, ok: true })
    } catch (e) {
      results.push({ url, ok: false, error: e instanceof Error ? e.message : String(e) })
    }
  }
  parentPort?.postMessage(results)
}
void main()
//# sourceMappingURL=prewarmWorker.js.map
