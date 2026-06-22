import type { ResolveAndCompileResult } from './types.ts'

import path from 'node:path'
import fs from '@magic/fs'

import { resolveAlias, resolveViteAlias } from '../viteConfig/index.ts'

import { importCache, pendingPromises } from '../../caches/cache.ts'
import { CACHE_DIR, CWD } from '../../../constants.ts'
import { acquireLock } from './acquireLock.ts'
import { isSvelteFile } from './isSvelteFile.ts'
import { getSvelteExports } from './getSvelteExports.ts'

import { pathToFileURL } from 'node:url'

import { compileSvelte } from './compileSvelte.ts'
import { processImports } from './processImports.ts'
import { computeRelativePath } from './computeRelativePath.ts'
import { classifyImport } from '../viteConfig/classifyImport.ts'
import { getTempFilePath } from './getTempFilePath.ts'
import { compileBarrel } from './compileBarrel.ts'
import { resolvePackageExport } from './resolvePackageExport.ts'
import { compileSvelteOnlyExport } from './resolveSvelteOnlyExports.ts'
import { tryStat } from '../../../lib/fs.ts'
import { traceStart, traceEnd } from '../../trace/timing.ts'
import { writeQueue } from './writeQueue.ts'
import { existsCached } from '../../caches/pathCache.ts'

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
  const id = traceStart(`resolveAndCompileImport ${importPath.split('/').pop() || importPath}`)
  try {
    return await resolveAndCompileImportImpl(importPath, sourceDir, sourceFilePath, importChain)
  } finally {
    traceEnd(id)
  }
}

const resolveAndCompileImportImpl = async (
  importPath: string,
  sourceDir: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<ResolveAndCompileResult> => {
  // Deduplicate concurrent requests using shared pendingPromises map
  const dedupKey = `resolve:${importPath}:${sourceDir}`
  const pending = pendingPromises.get(dedupKey) as Promise<ResolveAndCompileResult> | undefined
  if (pending) {
    return pending
  }

  const promise = resolveAndCompileImportImplCore(
    importPath,
    sourceDir,
    sourceFilePath,
    importChain,
  )
  pendingPromises.set(dedupKey, promise)
  try {
    return await promise
  } finally {
    pendingPromises.delete(dedupKey)
  }
}

const resolveAndCompileImportImplCore = async (
  importPath: string,
  sourceDir: string,
  sourceFilePath: string,
  importChain: string[] = [],
): Promise<ResolveAndCompileResult> => {
  const importType = classifyImport(importPath)

  if (importPath === 'svelte') {
    const svelteClient = path.resolve(CWD, 'node_modules/svelte/src/index-client.js')
    if (await existsCached(svelteClient)) {
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, svelteClient)
      return { filePath: importPath, js: '', url: relativePath }
    }
  }

  if (importType === 'scoped') {
    const scopedId = traceStart('resolve.scoped')
    if (importPath.startsWith('@magic/')) {
      traceEnd(scopedId)
      return { filePath: importPath, js: '', url: null, skipProcessing: true }
    }
    const resolved = await resolvePackageExport(importPath, sourceDir)
    traceEnd(scopedId)
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
    const bareId = traceStart('resolve.bare')
    const resolved = await resolvePackageExport(importPath, sourceDir)
    if (resolved.isSvelteOnly && resolved.resolvedPath) {
      traceEnd(bareId)
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
      traceEnd(bareId)
      return { filePath: importPath, js: '', url: relativePath }
    }
    traceEnd(bareId)
    return { filePath: importPath, js: '', url: null, skipProcessing: true }
  }

  let resolvedPath: string | undefined

  if (importType === 'vite-alias') {
    const aliasId = traceStart('resolve.vite-alias')
    const aliasResolved = await resolveViteAlias(importPath, sourceFilePath)
    if (aliasResolved) {
      resolvedPath = aliasResolved
      traceEnd(aliasId)
    } else {
      if (importPath.startsWith('$lib')) {
        const rootDir = await (async () => {
          let current = path.dirname(sourceFilePath)
          const root = CWD
          while (current && current !== path.dirname(current)) {
            const pkgPath = path.join(current, 'package.json')
            if (await existsCached(pkgPath)) {
              return current
            }
            current = path.dirname(current)
          }
          return root
        })()
        const aliasPath = importPath.slice(1)
        resolvedPath = path.resolve(rootDir, 'src', aliasPath)
      } else if (importPath.startsWith('$app')) {
        const rootDir = CWD
        const shimName = importPath.slice(5)
        resolvedPath = path.join(rootDir, 'src/lib/svelte/shims/$app', shimName)
      } else {
        traceEnd(aliasId)
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
    const extId = traceStart('resolve.extensions')
    const extensions = ['.ts', '.js', '.svelte', '/index.ts', '/index.js', '/index.svelte']
    for (const ext of extensions) {
      const withExt = resolvedPath + ext
      if (await existsCached(withExt)) {
        resolvedPath = withExt
        break
      }
    }
    traceEnd(extId)
  } else if (resolvedPath.endsWith('.js')) {
    const tsPath = resolvedPath.slice(0, -3) + '.ts'
    if (await existsCached(tsPath)) {
      resolvedPath = tsPath
    }
  } else if (resolvedPath.endsWith('.svelte')) {
    if (!(await existsCached(resolvedPath))) {
      const svelteJsPath = resolvedPath + '.js'
      if (await existsCached(svelteJsPath)) {
        resolvedPath = svelteJsPath
      }
    }
  }

  const pathStats = await tryStat(resolvedPath)
  if (pathStats?.isDirectory()) {
    const importFileName = path.basename(importPath)
    const possibleFile = path.join(resolvedPath, importFileName)

    const withSvelte = possibleFile.endsWith('.svelte') ? possibleFile : possibleFile + '.svelte'
    if (await existsCached(withSvelte)) {
      resolvedPath = withSvelte
    } else if (importPath.includes('/')) {
      const fileName = importPath.split('/').pop() ?? ''
      const directCandidate = path.join(resolvedPath, fileName)
      if (await existsCached(directCandidate)) {
        resolvedPath = directCandidate
      }
    }
  }

  if (!(await existsCached(resolvedPath))) {
    // Parallel existence checks
    const checks = [
      { path: resolvedPath + '.svelte', result: resolvedPath + '.svelte' },
      {
        path: path.join(resolvedPath, 'index.svelte'),
        result: path.join(resolvedPath, 'index.svelte'),
      },
    ]
    if (!path.extname(resolvedPath) && !resolvedPath.includes('.')) {
      const sourceDirName = path.dirname(sourceFilePath)
      const possiblePath = path.join(sourceDirName, importPath.replace(/^\.\//, ''))
      checks.push({ path: possiblePath, result: possiblePath })
    }

    const results = await Promise.all(
      checks.map(c => fs.exists(c.path).then(exists => (exists ? c.result : null))),
    )
    const found = results.find(r => r !== null)
    if (found) {
      resolvedPath = found as string
    }
  }

  const ext = path.extname(resolvedPath)
  if (ext === '.ts' || ext === '.js') {
    const barrelId = traceStart('compileBarrel')
    const exports = await getSvelteExports(resolvedPath)
    if (exports.length > 0) {
      const barrelResult = await compileBarrel(resolvedPath, importChain)
      traceEnd(barrelId)
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, barrelResult.wrapperAbsPath)
      return { filePath: resolvedPath, js: barrelResult.js, url: relativePath }
    }
    traceEnd(barrelId)
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

  const relPath = path.relative(CWD, resolvedPath)
  const tmpFile = path.join(CACHE_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const tmpFileAbs = path.join(CWD, tmpFile)

  const release = await acquireLock(tmpFile)

  try {
    const compileId = traceStart('compile.svelte-file')
    const cached = importCache.get(resolvedPath)
    if (cached) {
      const stats = await fs.stat(resolvedPath)
      if (stats.mtimeMs === cached.mtime) {
        traceEnd(compileId, 'cache hit')
        const sourceTmpFile = getTempFilePath(sourceFilePath)
        const fromDir = path.dirname(sourceTmpFile)
        const relativePath = computeRelativePath(fromDir, cached.absPath)
        return { filePath: resolvedPath, js: cached.js, url: relativePath }
      }
    }

    const { js } = await compileSvelte(resolvedPath)

    const newChain = [...importChain, resolvedPath]
    const processId = traceStart('processImports')
    const processed = await processImports(js, resolvedPath, newChain)
    traceEnd(processId)

    const writeId = traceStart('fs.writeFile')
    await writeQueue.write(tmpFile, processed)
    traceEnd(writeId)

    const stats = await fs.stat(resolvedPath)

    importCache.set(resolvedPath, {
      js: processed,
      absPath: tmpFileAbs,
      mtime: stats.mtimeMs,
    })
    traceEnd(compileId)

    const sourceTmpFile = getTempFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, tmpFileAbs)

    return { filePath: resolvedPath, js: processed, url: relativePath }
  } finally {
    release()
  }
}
