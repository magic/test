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

const main = async (): Promise<void> => {
  const urls: string[] = workerData.urls ?? []
  const results: { url: string; ok: boolean; error?: string }[] = []
  for (const url of urls) {
    try {
      await import(url)
      results.push({ url, ok: true })
    } catch (e) {
      results.push({ url, ok: false, error: e instanceof Error ? e.message : String(e) })
    }
  }
  parentPort?.postMessage(results)
}

void main()
