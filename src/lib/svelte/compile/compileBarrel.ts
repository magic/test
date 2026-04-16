import path from 'node:path'

import fs from '@magic/fs'

import { barrelCache, processingBarrels } from './cache.js'
import { TMP_DIR } from './constants.js'
import { getSvelteExports } from './getSvelteExports.js'
import { processImports } from './processImports.js'
import { compileSvelte } from './compileSvelte.js'
import { computeRelativePath } from './computeRelativePath.js'

export const compileBarrel = async (
  filePath: string,
  importChain: string[] = [],
): Promise<{ filePath: string; js: { code: string }; wrapperAbsPath: string }> => {
  const cached = barrelCache.get(filePath)
  if (cached) {
    return { filePath, js: { code: '' }, wrapperAbsPath: cached.wrapperAbsPath }
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

    const compiledExports: { name: string; absPath: string }[] = []

    for (const { name, path: sveltePath } of exports) {
      const { js } = await compileSvelte(sveltePath)
      const processed = await processImports(js.code, sveltePath, currentChain)

      const relPath = path.relative(process.cwd(), sveltePath)
      const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))

      await fs.mkdirp(path.dirname(tmpFile))
      await fs.writeFile(tmpFile, processed.code)

      compiledExports.push({ name, absPath: path.resolve(tmpFile) })
    }

    const barrelRelPath = path.relative(process.cwd(), filePath)
    const wrapperFile = path.join(TMP_DIR, barrelRelPath.replace(/\.(ts|js)$/, '.barrel.js'))
    const wrapperAbsPath = path.resolve(wrapperFile)
    const wrapperTmpDir = path.dirname(wrapperAbsPath)

    const wrapperExports = compiledExports
      .map(({ name, absPath }) => {
        if (name.startsWith('type ') || name === '') {
          return null
        }
        const relative = computeRelativePath(wrapperTmpDir, absPath)
        if (name === 'default') {
          return `export { default } from '${relative}'`
        }
        return `export { ${name} } from '${relative}'`
      })
      .filter(Boolean)

    const wrapperCode = wrapperExports.join('\n')

    await fs.mkdirp(path.dirname(wrapperFile))
    await fs.writeFile(wrapperFile, wrapperCode)

    barrelCache.set(filePath, { exports, wrapperAbsPath })

    return { filePath, js: { code: wrapperCode }, wrapperAbsPath }
  } finally {
    processingBarrels.delete(filePath)
  }
}
