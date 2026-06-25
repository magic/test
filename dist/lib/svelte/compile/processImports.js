import path from 'node:path'
import crypto from 'node:crypto'
import log from '@magic/log'
import is from '@magic/types'
import { LRUCache } from '../../caches/LRUCache.js'
import { SVELTE_IMPORT_REGEX } from '../constants.js'
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
  const imports = []
  let match
  const regex = new RegExp(SVELTE_IMPORT_REGEX.source, 'g')
  while ((match = regex.exec(code)) !== null) {
    if (match[1] && match[2] && match[0]) {
      const matchStart = match.index
      let inBlockComment = false
      for (let i = 0; i < matchStart; i++) {
        if (code[i] === '/' && code[i + 1] === '*') {
          inBlockComment = true
        } else if (code[i] === '*' && code[i + 1] === '/') {
          inBlockComment = false
        }
      }
      if (inBlockComment) {
        continue
      }
      const lineStart = code.lastIndexOf('\n', matchStart) + 1
      const lineBeforeMatch = code.slice(lineStart, matchStart)
      if (lineBeforeMatch.includes('//')) {
        continue
      }
      imports.push({ imported: match[1], path: match[2], full: match[0] })
    }
  }
  const importCount = imports.length
  // Parallelize import resolution
  // Add current sourceFilePath to chain to detect circular imports
  const chainWithCurrent = [...importChain, sourceFilePath]
  const results = await parallelMap(
    imports.map((item, i) => ({ item, index: i })),
    async ({ item, index }) => {
      const { imported, path: importPath } = item
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
        return { imported, importPath, result }
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
  for (const { imported, importPath, result } of results) {
    // Handle circular imports - remove the import statement since the module will
    // export itself. The import would create a circular dependency anyway.
    const normalizedSource = path.resolve(sourceFilePath)
    const normalizedResult = path.resolve(result.filePath)
    if (normalizedSource === normalizedResult) {
      // Self-referencing import - remove it entirely
      const importRegex = new RegExp(
        `import\\s+${imported.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+from\\s+['\"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]`,
        'g',
      )
      processedCode = processedCode.replace(
        importRegex,
        `/* Circular self-reference: ${imported} will be exported by this module */`,
      )
      continue
    }
    if ('skipProcessing' in result && result.skipProcessing) {
      const isSvelteOnlyPackage = 'isSvelteOnlyPackage' in result && result.isSvelteOnlyPackage
      if (isSvelteOnlyPackage) {
        const importRegex = new RegExp(
          `import\\s+${imported.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+from\\s+['\"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]`,
          'g',
        )
        processedCode = processedCode.replace(importRegex, `const ${imported} = {}`)
      }
      continue
    }
    const url = 'url' in result && result.url
    if (!url) {
      continue
    }
    const importRegex = new RegExp(
      `import\\s+${imported.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+from\\s+['\"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]`,
      'g',
    )
    processedCode = processedCode.replace(importRegex, `import ${imported} from '${url}'`)
  }
  return processedCode
}
