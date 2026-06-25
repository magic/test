import path from 'node:path'
import crypto from 'node:crypto'

import log from '@magic/log'
import is from '@magic/types'

import { LRUCache } from '../../caches/LRUCache.ts'
import { extractImportsSync } from './astParse.ts'
import { resolveAndCompileImport } from './resolveAndCompileImport.ts'
import { traceStart, traceEnd } from '../../trace/timing.ts'
import { parallelMap, MAX_CONCURRENT } from './parallelMap.ts'

// Cache for processImports results (key: codeHash:sourceFilePath)
const processImportsCache = new LRUCache<{ code: string; result: string }>(200)

export const processImports = async (
  code: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<string> => {
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

const processImportsImpl = async (
  code: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<string> => {
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
    // Handle circular imports - remove the import statement since the module will
    // export itself. The import would create a circular dependency anyway.
    const normalizedSource = path.resolve(sourceFilePath)
    const normalizedResult = path.resolve(result.filePath)
    if (normalizedSource === normalizedResult) {
      // Self-referencing import - remove it entirely using AST position
      processedCode =
        processedCode.slice(0, start) +
        `/* Circular self-reference: ${imported} will be exported by this module */` +
        processedCode.slice(end)
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
