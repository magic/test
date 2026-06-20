import path from 'node:path'
import log from '@magic/log'
import is from '@magic/types'
import { SVELTE_IMPORT_REGEX } from '../constants.js'
import { resolveAndCompileImport } from './resolveAndCompileImport.js'
import { traceStart, traceEnd } from './timing.js'
export const processImports = async (code, sourceFilePath, importChain = []) => {
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
