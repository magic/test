import path from 'node:path'

import log from '@magic/log'
import is from '@magic/types'

import { SVELTE_IMPORT_REGEX } from './constants.js'
import { resolveAndCompileImport } from './resolveAndCompileImport.js'

export const processImports = async (
  code: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<{ code: string }> => {
  let processedCode = code
  const sourceDir = path.dirname(sourceFilePath)
  const imports: { imported: string; path: string; full: string }[] = []

  let match
  const regex = new RegExp(SVELTE_IMPORT_REGEX.source, 'g')
  while ((match = regex.exec(code)) !== null) {
    if (match[1] && match[2] && match[0]) {
      imports.push({ imported: match[1], path: match[2], full: match[0] })
    }
  }

  for (const { imported, path: importPath } of imports) {
    try {
      const result = await resolveAndCompileImport(
        importPath,
        sourceDir,
        sourceFilePath,
        importChain,
      )

      if ('skipProcessing' in result && result.skipProcessing) {
        continue
      }

      const url = 'url' in result && result.url
      if (!url) {
        continue
      }
      const importRegex = new RegExp(
        `import\\s+${imported.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
        'g',
      )
      processedCode = processedCode.replace(importRegex, `import ${imported} from '${url}'`)
    } catch (e) {
      const message = is.error(e) ? e.message : String(e)
      log.error('Could not resolve import', importPath, message)
      throw e
    }
  }

  return { code: processedCode }
}
