import path from 'node:path'
import crypto from 'node:crypto'
import log from '@magic/log'
import is from '@magic/types'
import { LRUCache } from '../../caches/LRUCache.js'
import { extractImportsSync } from './astParse.js'
import { resolveAndCompileImport } from './resolveAndCompileImport.js'
import { traceStart, traceEnd } from '../../trace/timing.js'
import { parallelMap, MAX_CONCURRENT } from './parallelMap.js'
// Cache for processImports results (key: codeHash:sourceFilePath)
const processImportsCache = new LRUCache(200)
export const processImports = async (code, sourceFilePath, importChain = []) => {
  // Skip caching if importChain is non-empty (might depend on circular deps)
  if (importChain.length === 0) {
    const cacheKey = `${sourceFilePath}:${crypto.createHash('md5').update(code).digest('hex')}`
    const cached = processImportsCache.get(cacheKey)
    if (cached && cached.code === code) {
      return cached.result
    }
    const result = await processImportsImpl(code, sourceFilePath, importChain)
    processImportsCache.set(cacheKey, { code, result })
    return result
  }
  const id = traceStart(`processImports ${path.basename(sourceFilePath)}`)
  try {
    return await processImportsImpl(code, sourceFilePath, importChain)
  } finally {
    traceEnd(id)
  }
}
const processImportsImpl = async (code, sourceFilePath, importChain = []) => {
  let processedCode = code
  const sourceDir = path.dirname(sourceFilePath)
  // Use AST-based import extraction (handles comments automatically)
  const astImports = extractImportsSync(code)
  const imports = astImports
    .filter(imp => imp.type === 'static' || imp.type === 'namespace')
    .map(imp => ({
      imported: imp.specifiers,
      path: imp.source,
      full: imp.originalText,
      start: imp.start,
      end: imp.end,
    }))
  const importCount = imports.length
  // Parallelize import resolution
  // Add current sourceFilePath to chain to detect circular imports
  const chainWithCurrent = [...importChain, sourceFilePath]
  const results = await parallelMap(
    imports.map((item, i) => ({ item, index: i })),
    async ({ item, index }) => {
      const { imported, path: importPath, start, end } = item
      const resolveId = traceStart(
        `resolve.import[${index + 1}/${importCount}] ${importPath.split('/').pop() || importPath}`,
      )
      try {
        const result = await resolveAndCompileImport(
          importPath,
          sourceDir,
          sourceFilePath,
          chainWithCurrent,
        )
        traceEnd(resolveId)
        return { imported, importPath, start, end, result }
      } catch (e) {
        traceEnd(resolveId, 'ERROR')
        const message = is.error(e) ? e.message : String(e)
        log.error('Could not resolve import', importPath, message)
        throw e
      }
    },
    MAX_CONCURRENT,
  )
  // Apply replacements in order (sequential to avoid conflicts)
  // Sort by start position descending so replacements don't affect later positions
  const sortedResults = results.sort((a, b) => b.start - a.start)
  for (const { imported, start, end, result } of sortedResults) {
    // Handle circular imports - keep the import statement for self-referencing.
    // Removing the import breaks self-references because Svelte compilers rename exports
    // (e.g., RenderJSX -> RenderJSX_1) but internal code still references the original name.
    // Node.js handles circular imports fine when the module is already loaded.
    // We just need to skip processing to avoid breaking the self-reference.
    const normalizedSource = path.resolve(sourceFilePath)
    const normalizedResult = path.resolve(result.filePath)
    if (normalizedSource === normalizedResult) {
      // Self-referencing import - skip processing, keep the import as-is
      // so internal calls to the imported name work correctly
      continue
    }
    if ('skipProcessing' in result && result.skipProcessing) {
      const isSvelteOnlyPackage = 'isSvelteOnlyPackage' in result && result.isSvelteOnlyPackage
      if (isSvelteOnlyPackage) {
        // Use AST position for direct replacement
        processedCode =
          processedCode.slice(0, start) + `const ${imported} = {}` + processedCode.slice(end)
      }
      continue
    }
    const url = 'url' in result && result.url
    if (!url) {
      continue
    }
    // Use AST position for direct replacement - no regex needed
    const newImportStatement = `import ${imported} from '${url}'`
    processedCode = processedCode.slice(0, start) + newImportStatement + processedCode.slice(end)
  }
  return processedCode
}
