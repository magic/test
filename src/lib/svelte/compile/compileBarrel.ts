import path from 'node:path'

import fs from '@magic/fs'

import { barrelCache, processingBarrels } from './cache.ts'
import { TMP_DIR, CWD } from '../../../constants.ts'
import { getSvelteExports } from './getSvelteExports.ts'
import { processImports } from './processImports.ts'
import { compileSvelte } from './compileSvelte.ts'
import { computeRelativePath } from './computeRelativePath.ts'

export const compileBarrel = async (
  filePath: string,
  importChain: string[] = [],
): Promise<{ filePath: string; js: string; wrapperAbsPath: string }> => {
  const cached = barrelCache.get(filePath)
  if (cached) {
    return { filePath, js: '', wrapperAbsPath: cached.wrapperAbsPath }
  }

  if (importChain.includes(filePath)) {
    const cycle = [...importChain, filePath].join(' → ')
    throw new Error(
      `Circular dependency detected: ${cycle}\n` +
        `Suggestion: Import Svelte components directly instead of using barrel files.\n` +
        `  Instead of: import { Button } from '$lib/forms'\n` +
        `  Use: import Button from '$lib/forms/Button.svelte'`,
    )
  }

  const currentChain = [...importChain, filePath]
  processingBarrels.add(filePath)

  try {
    const exports = await getSvelteExports(filePath)

    if (exports.length === 0) {
      throw new Error(`No Svelte exports found in barrel file: ${filePath}`)
    }

    const compiledExports: { name: string; absPath: string; isDefaultReexport?: boolean }[] = []

    for (const exp of exports) {
      const { name, path: sveltePath, isDefaultReexport } = exp
      const { js } = await compileSvelte(sveltePath)
      const processed = await processImports(js, sveltePath, currentChain)

      const relPath = path.relative(CWD, sveltePath)
      const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))

      await fs.mkdirp(path.dirname(tmpFile))
      await fs.writeFile(tmpFile, processed)

      compiledExports.push({ name, absPath: path.join(CWD, tmpFile), isDefaultReexport })
    }

    const barrelRelPath = path.relative(CWD, filePath)
    const wrapperFile = path.join(TMP_DIR, barrelRelPath.replace(/\.(ts|js)$/, '.barrel.js'))
    const wrapperAbsPath = path.join(CWD, wrapperFile)
    const wrapperTmpDir = path.dirname(wrapperAbsPath)

    const wrapperExports = compiledExports
      .map(({ name, absPath, isDefaultReexport }) => {
        if (name.startsWith('type ') || name === '') {
          return null
        }
        const relative = computeRelativePath(wrapperTmpDir, absPath)

        if (name === 'default') {
          return `export { default } from '${relative}'`
        }

        if (name.includes(' as ') || isDefaultReexport) {
          const exportedName = name.includes(' as ')
            ? name
                .split(/\s+as\s+/)
                .pop()
                ?.trim()
            : name
          if (exportedName) {
            return `export { default as ${exportedName} } from '${relative}'`
          }
        }

        return `export { ${name} } from '${relative}'`
      })
      .filter(Boolean)

    const wrapperCode = wrapperExports.join('\n')

    await fs.mkdirp(path.dirname(wrapperFile))
    await fs.writeFile(wrapperFile, wrapperCode)

    barrelCache.set(filePath, { exports, wrapperAbsPath })

    return { filePath, js: wrapperCode, wrapperAbsPath }
  } finally {
    processingBarrels.delete(filePath)
  }
}
