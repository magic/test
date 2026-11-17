import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'

import { getCwd } from '../../../constants.js'
import { getCachedCompile, recordCompile } from '../../caches/persistentCache.js'
import { traceStart, traceEnd } from '../../trace/timing.js'
import { extractImportsSync } from './astParse.js'
import { compileSvelte } from './compileSvelte.js'
import { writeCompiledFile } from './fileWriter.js'
import { getTempFilePath } from './getTempFilePath.js'
import { processImports } from './processImports.js'
import { transformForNode } from './transformForNode.js'
/**
 * The single compile entry point for .svelte sources.
 *
 * CACHE-AWARE (P0-1): when the persistent cache holds a valid entry for this
 * source (stat/mtime+size fast path, hash-validated on mismatch) and the
 * compiled island is intact (see compiledImportsExist), the already compiled
 * file is served as-is — no svelte compile, no processImports, no transform,
 * no rewrites, no manifest update. This is what makes repeated mounts of the
 * same component (every component test), worker prewarming and the
 * main-thread prewarm cheap instead of N× redundant compiles.
 *
 * The returned `js` is the canonical file content (including the
 * sourceMappingURL line) in BOTH the hit and miss cases, so callers see
 * identical shapes regardless of cache state.
 *
 * The css sidecar (written next to the compiled file on miss) keeps the
 * public `css` TestContext field correct on hits — the manifest stores JS
 * only.
 *
 * MAGIC_TEST_COMPILE_CACHE=0 restores the old always-recompile behavior
 * (kill switch for downstream rollback).
 */
// CSS sidecar location for a compiled source (next to its compiled file).
const cssSidecarPath = resolvedPath => `${getTempFilePath(resolvedPath)}.css.json`
const readCssSidecar = async resolvedPath => {
  try {
    const raw = await fs.readFile(cssSidecarPath(resolvedPath), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}
/**
 * A cached compile is a self-contained "island": its import statements point
 * at the COMPILED temp files of its dependencies (written by processImports),
 * not at the sources. If something deleted those sibling artifacts (a test
 * cleaning up a fixture directory, a partial cache cleanup) while the source
 * and the manifest entry survived, the stale compiled parent still passes
 * the hash check but its import targets are gone. Verify that every relative
 * import target still exists before serving a hit; a missing target means a
 * recompile (which rewrites the parent AND re-records its deps, healing the
 * island). Bare/node: specifiers resolve to node_modules and are not checked.
 */
const compiledImportsExist = async (js, compiledFileAbs) => {
  const dir = path.dirname(compiledFileAbs)
  for (const imp of extractImportsSync(js)) {
    const src = imp.source
    if (!src || !src.startsWith('.')) {
      continue
    }
    const target = path.resolve(dir, src.split('?')[0])
    if (!(await fs.exists(target))) {
      return false
    }
  }
  return true
}
export const compileSvelteWithWrite = async filePath => {
  const id = traceStart(`compileSvelteWithWrite ${path.basename(filePath)}`)
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(getCwd(), filePath)
  const tmpFile = getTempFilePath(resolvedPath)
  const tmpFileAbs = path.resolve(getCwd(), tmpFile)
  const compileFresh = async (forceImports = false) => {
    const { js, css, map } = await compileSvelte(filePath)
    // Transform imports (resolves $app/*, $lib/*, etc.)
    const processId = traceStart('processImports')
    const code = await processImports(js, filePath, [], forceImports)
    traceEnd(processId)
    // Node.js compatibility transforms
    const transformId = traceStart('transformForNode')
    const transformedCode = transformForNode(code, filePath)
    traceEnd(transformId)
    const canonical = transformedCode + `//# sourceMappingURL=${path.basename(tmpFileAbs)}.map\n`
    const { tmpFile: writtenTmpFile, importUrl } = await writeCompiledFile(
      tmpFile,
      canonical,
      map,
      true,
      resolvedPath,
    )
    // Record in the persistent cache so test workers hit the compiled file
    // (hash-validated) instead of recompiling the app component per worker.
    // This is the SINGLE owner of the cache entry: cacheManager must not
    // record again (the old double-record also stripped the sourceMappingURL
    // line from the persisted file, breaking V8 coverage remapping).
    await recordCompile(resolvedPath, canonical)
    // Persist css next to the compiled file so cache hits can return the
    // same css object a miss would (public TestContext.css field).
    // Note: this write happens AFTER recordCompile, so a concurrent cache
    // hit can observe the manifest entry one tick before the sidecar lands
    // and get css: null once — acceptable (css is advisory in tests), and
    // the next miss rewrites it deterministically.
    if (css) {
      try {
        await fs.writeFile(cssSidecarPath(resolvedPath), JSON.stringify(css))
      } catch {
        // sidecar is best-effort; a failed write degrades css to null on
        // hits but never breaks the compile itself
      }
    } else {
      // Drop a stale sidecar from a previous compile of a version of this
      // file that had styles.
      try {
        await fs.unlink(cssSidecarPath(resolvedPath))
      } catch {
        // no sidecar — nothing to do
      }
    }
    return { js: canonical, css, tmpFile: writtenTmpFile, importUrl }
  }
  try {
    if (process.env.MAGIC_TEST_COMPILE_CACHE !== '0') {
      const cached = await getCachedCompile(resolvedPath)
      if (cached) {
        if (await compiledImportsExist(cached.js, tmpFileAbs)) {
          traceEnd(id, 'cached [persistent]')
          return {
            js: cached.js,
            css: await readCssSidecar(resolvedPath),
            tmpFile,
            importUrl: pathToFileURL(tmpFileAbs).href,
          }
        }
        // Valid entry, but a compiled import target is missing (sibling
        // artifacts deleted out from under the island) — recompile, which
        // rewrites the parent and re-records its deps. forceImports: the
        // processImports result cache would otherwise return the SAME cached
        // rewrite (source code unchanged) that still points at the deleted
        // artifacts — bypassing it is what actually re-resolves the deps.
        traceEnd(id, 'stale island, recompiling')
        return await compileFresh(true)
      }
    }
    return await compileFresh()
  } catch (e) {
    traceEnd(id, `ERROR: ${e.message}`)
    throw e
  }
}
//# sourceMappingURL=compileSvelteWithWrite.js.map
