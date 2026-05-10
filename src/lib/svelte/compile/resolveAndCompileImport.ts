import type { ResolveAndCompileResult } from './types.ts'

import path from 'node:path'
import nodeFs from 'node:fs'
import fs from '@magic/fs'

import { resolveAlias, resolveViteAlias } from '../viteConfig/index.ts'

import { importCache } from './cache.ts'
import { TMP_DIR } from '../../../constants.ts'
import { acquireLock } from './acquireLock.ts'
import { isSvelteFile } from './isSvelteFile.ts'
import { getSvelteExports } from './getSvelteExports.ts'

import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

import { compileSvelte } from './compileSvelte.ts'
import { processImports } from './processImports.ts'
import { computeRelativePath } from './computeRelativePath.ts'
import { classifyImport } from './classifyImport.ts'
import { getTempFilePath } from './getTempFilePath.ts'
import { compileBarrel } from './compileBarrel.ts'
import { resolvePackageExport } from './resolvePackageExport.ts'
import { compileSvelteOnlyExport } from './resolveSvelteOnlyExports.ts'

const nodeModulesPath = (pkgName: string, sourceDir: string): string => {
  const require_ = createRequire(pathToFileURL(sourceDir + '/'))
  const resolved = require_.resolve(pkgName)
  let nodeModulesPath = path.dirname(resolved)
  while (nodeModulesPath && !nodeFs.existsSync(path.join(nodeModulesPath, 'package.json'))) {
    nodeModulesPath = path.dirname(nodeModulesPath)
  }
  return nodeModulesPath || path.dirname(resolved)
}

const extractNamedImportsFromCode = (code: string, spec: string): string[] => {
  const namedImports: string[] = []
  const escapedSpec = spec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const importRe = new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"\`]${escapedSpec}['"\`]`, 'g')
  for (const match of code.matchAll(importRe)) {
    if (match[1]) {
      const names = match[1].split(',').map(n => {
        const trimmed = n.trim()
        const asParts = trimmed.split(' as ')
        return asParts.length > 1 && asParts[1] ? asParts[1] : trimmed
      })
      namedImports.push(...names.filter(Boolean))
    }
  }
  return namedImports
}

export const resolveAndCompileImport = async (
  importPath: string,
  sourceDir: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<ResolveAndCompileResult> => {
  const importType = classifyImport(importPath)

  if (importPath === 'svelte') {
    const svelteClient = path.resolve(process.cwd(), 'node_modules/svelte/src/index-client.js')
    if (await fs.exists(svelteClient)) {
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, svelteClient)
      return { filePath: importPath, js: '', url: relativePath }
    }
  }

  if (importType === 'scoped') {
    if (importPath.startsWith('@magic/')) {
      return { filePath: importPath, js: '', url: null, skipProcessing: true }
    }
    const resolved = await resolvePackageExport(importPath, sourceDir)
    if (resolved.isSvelteOnly && resolved.resolvedPath) {
      if (resolved.isSvelteOnlyPackage) {
        return {
          filePath: importPath,
          js: '',
          url: null,
          skipProcessing: true,
          isSvelteOnlyPackage: true,
        }
      }
      const sourceCode = await fs.readFile(sourceFilePath, 'utf-8')
      const namedImports = extractNamedImportsFromCode(sourceCode, importPath)
      const compiledPath = await compileSvelteOnlyExport(
        resolved.resolvedPath,
        sourceDir,
        namedImports.length > 0 ? namedImports : undefined,
      )
      const compiledUrl = pathToFileURL(compiledPath).href
      return { filePath: importPath, js: '', url: compiledUrl }
    }
    return { filePath: importPath, js: '', url: null, skipProcessing: true }
  }

  if (importType === 'bare') {
    const resolved = await resolvePackageExport(importPath, sourceDir)
    if (resolved.isSvelteOnly && resolved.resolvedPath) {
      // If this is a svelte-only package (only has svelte export, no import/node condition),
      // skip processing because the compiled output would contain imports Node.js can't resolve
      if (resolved.isSvelteOnlyPackage) {
        return {
          filePath: importPath,
          js: '',
          url: null,
          skipProcessing: true,
          isSvelteOnlyPackage: true,
        }
      }
      const sourceCode = await fs.readFile(sourceFilePath, 'utf-8')
      const namedImports = extractNamedImportsFromCode(sourceCode, importPath)
      const compiledPath = await compileSvelteOnlyExport(
        resolved.resolvedPath,
        sourceDir,
        namedImports.length > 0 ? namedImports : undefined,
      )
      const compiledUrl = pathToFileURL(compiledPath).href
      return { filePath: importPath, js: '', url: compiledUrl }
    }
    if (resolved.resolvedPath && !resolved.isSvelteOnly) {
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, resolved.resolvedPath)
      return { filePath: importPath, js: '', url: relativePath }
    }
    return { filePath: importPath, js: '', url: null, skipProcessing: true }
  }

  let resolvedPath: string | undefined

  if (importType === 'vite-alias') {
    const aliasResolved = await resolveViteAlias(importPath, sourceFilePath)
    if (aliasResolved) {
      resolvedPath = aliasResolved
    } else {
      if (importPath.startsWith('$lib')) {
        const rootDir = await (async () => {
          let current = path.dirname(sourceFilePath)
          const root = process.cwd()
          while (current && current !== path.dirname(current)) {
            const pkgPath = path.join(current, 'package.json')
            if (await fs.exists(pkgPath)) {
              return current
            }
            current = path.dirname(current)
          }
          return root
        })()
        const aliasPath = importPath.slice(1)
        resolvedPath = path.resolve(rootDir, 'src', aliasPath)
      } else if (importPath.startsWith('$app')) {
        const rootDir = process.cwd()
        const shimName = importPath.slice(5)
        resolvedPath = path.join(rootDir, 'src/lib/svelte/shims/$app', shimName)
      } else {
        return { filePath: importPath, js: '', url: null, skipProcessing: true }
      }
    }
  } else {
    const aliasResolved = await resolveAlias(importPath, sourceFilePath)
    if (aliasResolved) {
      resolvedPath = aliasResolved
    } else {
      resolvedPath = path.resolve(sourceDir, importPath)
    }
  }

  if (!path.extname(resolvedPath)) {
    const extensions = ['.ts', '.js', '.svelte', '/index.ts', '/index.js', '/index.svelte']
    for (const ext of extensions) {
      const withExt = resolvedPath + ext
      if (await fs.exists(withExt)) {
        resolvedPath = withExt
        break
      }
    }
  } else if (resolvedPath.endsWith('.js')) {
    const tsPath = resolvedPath.slice(0, -3) + '.ts'
    if (await fs.exists(tsPath)) {
      resolvedPath = tsPath
    }
  } else if (resolvedPath.endsWith('.svelte')) {
    if (!(await fs.exists(resolvedPath))) {
      const svelteJsPath = resolvedPath + '.js'
      if (await fs.exists(svelteJsPath)) {
        resolvedPath = svelteJsPath
      }
    }
  }

  const pathStats = (await fs.exists(resolvedPath)) ? await fs.stat(resolvedPath) : null
  if (pathStats?.isDirectory()) {
    const importFileName = path.basename(importPath)
    const possibleFile = path.join(resolvedPath, importFileName)

    const withSvelte = possibleFile.endsWith('.svelte') ? possibleFile : possibleFile + '.svelte'
    if (await fs.exists(withSvelte)) {
      resolvedPath = withSvelte
    } else if (importPath.includes('/')) {
      const fileName = importPath.split('/').pop() ?? ''
      const directCandidate = path.join(resolvedPath, fileName)
      if (await fs.exists(directCandidate)) {
        resolvedPath = directCandidate
      }
    }
  }

  if (!(await fs.exists(resolvedPath))) {
    if (await fs.exists(resolvedPath + '.svelte')) {
      resolvedPath = resolvedPath + '.svelte'
    } else if (await fs.exists(path.join(resolvedPath, 'index.svelte'))) {
      resolvedPath = path.join(resolvedPath, 'index.svelte')
    } else if (!path.extname(resolvedPath) && !resolvedPath.includes('.')) {
      const sourceDirName = path.dirname(sourceFilePath)
      const possiblePath = path.join(sourceDirName, importPath.replace(/^\.\//, ''))
      if (await fs.exists(possiblePath)) {
        resolvedPath = possiblePath
      }
    }
  }

  const ext = path.extname(resolvedPath)
  if (ext === '.ts' || ext === '.js') {
    const exports = await getSvelteExports(resolvedPath)
    if (exports.length > 0) {
      const barrelResult = await compileBarrel(resolvedPath, importChain)
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, barrelResult.wrapperAbsPath)
      return { filePath: resolvedPath, js: barrelResult.js, url: relativePath }
    }
  }

  if (!isSvelteFile(resolvedPath)) {
    const sourceTmpFile = getTempFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, resolvedPath)
    return { filePath: resolvedPath, js: '', url: relativePath }
  }

  if (importChain.includes(resolvedPath)) {
    const sourceTmpFile = getTempFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, resolvedPath)
    return { filePath: resolvedPath, js: '', url: relativePath }
  }

  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const tmpFileAbs = path.join(process.cwd(), tmpFile)

  const release = await acquireLock(tmpFile)

  try {
    const cached = importCache.get(resolvedPath)
    if (cached) {
      const stats = await fs.stat(resolvedPath)
      if (stats.mtime.getTime() === cached.mtime) {
        const sourceTmpFile = getTempFilePath(sourceFilePath)
        const fromDir = path.dirname(sourceTmpFile)
        const relativePath = computeRelativePath(fromDir, cached.absPath)
        return { filePath: resolvedPath, js: cached.js, url: relativePath }
      }
    }

    const { js } = await compileSvelte(resolvedPath)

    const newChain = [...importChain, resolvedPath]
    const processed = await processImports(js, resolvedPath, newChain)

    await fs.mkdirp(path.dirname(tmpFile))
    await fs.writeFile(tmpFile, processed)

    const stats = await fs.stat(resolvedPath)

    importCache.set(resolvedPath, {
      js: processed,
      absPath: tmpFileAbs,
      mtime: stats.mtime.getTime(),
    })

    const sourceTmpFile = getTempFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, tmpFileAbs)

    return { filePath: resolvedPath, js: processed, url: relativePath }
  } finally {
    release()
  }
}
