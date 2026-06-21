import path from 'node:path'
import crypto from 'node:crypto'

import log from '@magic/log'
import is from '@magic/types'

import { SVELTE_IMPORT_REGEX } from '../constants.ts'
import { resolveAndCompileImport } from './resolveAndCompileImport.ts'
import { traceStart, traceEnd } from './timing.ts'

// Cache for processImports results (key: codeHash:sourceFilePath)
const processImportsCache = new Map<string, { code: string; result: string }>()
const MAX_CACHE_SIZE = 200

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
    // Evict oldest if cache full
    if (processImportsCache.size >= MAX_CACHE_SIZE) {
      const firstKey = processImportsCache.keys().next().value
      if (firstKey) {
        processImportsCache.delete(firstKey)
      }
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
  const imports: { imported: string; path: string; full: string }[] = []

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
  for (let i = 0; i < imports.length; i++) {
    const item = imports[i]
    if (!item) {
      continue
    }
    const { imported, path: importPath } = item
    const resolveId = traceStart(
      `resolve.import[${i + 1}/${importCount}] ${importPath.split('/').pop() || importPath}`,
    )
    try {
      const result = await resolveAndCompileImport(
        importPath,
        sourceDir,
        sourceFilePath,
        importChain,
      )

      if ('skipProcessing' in result && result.skipProcessing) {
        // Check if this is a svelte-only package that would fail Node resolution
        // In that case, replace the import with a stub since the compiled code
        // that includes this import will be run by Node.js
        const isSvelteOnlyPackage = 'isSvelteOnlyPackage' in result && result.isSvelteOnlyPackage
        if (isSvelteOnlyPackage) {
          const importRegex = new RegExp(
            `import\\s+${imported.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
            'g',
          )
          processedCode = processedCode.replace(importRegex, `const ${imported} = {}`)
        }
        traceEnd(resolveId)
        continue
      }

      const url = 'url' in result && result.url
      if (!url) {
        traceEnd(resolveId)
        continue
      }
      const importRegex = new RegExp(
        `import\\s+${imported.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
        'g',
      )
      processedCode = processedCode.replace(importRegex, `import ${imported} from '${url}'`)
      traceEnd(resolveId)
    } catch (e) {
      traceEnd(resolveId, 'ERROR')
      const message = is.error(e) ? e.message : String(e)
      log.error('Could not resolve import', importPath, message)
      throw e
    }
  }

  return processedCode
}
