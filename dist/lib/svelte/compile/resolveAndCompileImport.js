import path from 'node:path'
import fs from '@magic/fs'
import { resolveAlias, resolveViteAlias } from '../viteConfig/index.js'
import { importCache } from './cache.js'
import { TMP_DIR } from './constants.js'
import { acquireLock } from './acquireLock.js'
import { isSvelteFile } from './isSvelteFile.js'
import { getSvelteExports } from './getSvelteExports.js'
import { compileSvelte } from './compileSvelte.js'
import { processImports } from './processImports.js'
import { computeRelativePath } from './computeRelativePath.js'
import { classifyImport } from './classifyImport.js'
import { getTempFilePath } from './getTempFilePath.js'
import { compileBarrel } from './compileBarrel.js'
export const resolveAndCompileImport = async (
  importPath,
  sourceDir,
  sourceFilePath,
  importChain = [],
) => {
  const importType = classifyImport(importPath)
  // Cycle detection - prevent infinite loops
  if (importChain.includes(sourceFilePath)) {
    return { filePath: importPath, js: { code: '' }, url: null, skipProcessing: true }
  }
  if (importPath === 'svelte') {
    const svelteClient = path.resolve(process.cwd(), 'node_modules/svelte/src/index-client.js')
    if (await fs.exists(svelteClient)) {
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, svelteClient)
      return { filePath: importPath, js: { code: '' }, url: relativePath }
    }
  }
  // For scoped/bare imports, try node_modules resolution first
  if (importType === 'scoped' || importType === 'bare') {
    const nodeModulesResult = await resolveNodeModulesImport(
      importPath,
      sourceFilePath,
      importChain,
    )
    if (nodeModulesResult) {
      return nodeModulesResult
    }
    return { filePath: importPath, js: { code: '' }, url: null, skipProcessing: true }
  }
  let resolvedPath
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
        return { filePath: importPath, js: { code: '' }, url: null, skipProcessing: true }
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
    // Check if it's a file without extension - if so, return it directly
    try {
      const stat = await fs.stat(resolvedPath)
      if (stat.isFile()) {
        // File exists without extension, use it as-is
      } else if (stat.isDirectory()) {
        const extensions = [
          '.ts',
          '.js',
          '.svelte.js',
          '/index.ts',
          '/index.js',
          '/index.svelte.js',
        ]
        for (const ext of extensions) {
          const withExt = resolvedPath + ext
          if (await fs.exists(withExt)) {
            resolvedPath = withExt
            break
          }
        }
      }
    } catch {
      // File doesn't exist, try extensions
      const extensions = ['.ts', '.js', '.svelte.js', '/index.ts', '/index.js', '/index.svelte.js']
      for (const ext of extensions) {
        const withExt = resolvedPath + ext
        if (await fs.exists(withExt)) {
          resolvedPath = withExt
          break
        }
      }
    }
  } else if (resolvedPath.endsWith('.js')) {
    const tsPath = resolvedPath.slice(0, -3) + '.ts'
    if (await fs.exists(tsPath)) {
      resolvedPath = tsPath
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
    const extensions = ['.ts', '.js', '.svelte.js', '/index.ts', '/index.js', '/index.svelte.js']
    for (const ext of extensions) {
      const withExt = resolvedPath + ext
      if (await fs.exists(withExt)) {
        resolvedPath = withExt
        break
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
    return { filePath: resolvedPath, js: { code: '' }, url: relativePath }
  }
  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const tmpFileAbs = path.resolve(process.cwd(), tmpFile)
  const release = await acquireLock(tmpFile)
  try {
    const cached = importCache.get(resolvedPath)
    if (cached) {
      const stats = await fs.stat(resolvedPath)
      if (stats.mtime.getTime() === cached.mtime) {
        const sourceTmpFile = getTempFilePath(sourceFilePath)
        const fromDir = path.dirname(sourceTmpFile)
        const relativePath = computeRelativePath(fromDir, cached.absPath)
        return { filePath: resolvedPath, js: { code: cached.code }, url: relativePath }
      }
    }
    const { js } = await compileSvelte(resolvedPath)
    const processed = await processImports(js.code, resolvedPath, importChain)
    await fs.mkdirp(path.dirname(tmpFile))
    await fs.writeFile(tmpFile, processed.code)
    const stats = await fs.stat(resolvedPath)
    importCache.set(resolvedPath, {
      code: processed.code,
      absPath: tmpFileAbs,
      mtime: stats.mtime.getTime(),
    })
    const sourceTmpFile = getTempFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, tmpFileAbs)
    return { filePath: resolvedPath, js: { code: processed.code }, url: relativePath }
  } finally {
    release()
  }
}
const resolveNodeModulesImport = async (importPath, sourceFilePath, importChain) => {
  if (importChain.includes(importPath)) {
    return null
  }
  const parts = importPath.split('/')
  if (!parts[0]) {
    return null
  }
  let packageName = parts[0]
  if (packageName.startsWith('@') && parts[1]) {
    packageName = parts[0] + '/' + parts[1]
  }
  // Cycle detection - check if this package is already being processed
  if (importChain.some(p => p.includes(packageName))) {
    return null
  }
  const nodeModulesPath = path.join(process.cwd(), 'node_modules', packageName)
  const pkgPath = path.join(nodeModulesPath, 'package.json')
  if (!(await fs.exists(pkgPath))) {
    return null
  }
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
  let entryPath = null
  if (pkg.exports?.['.']?.svelte) {
    entryPath = path.join(nodeModulesPath, pkg.exports['.'].svelte)
  } else if (pkg.exports?.['.']?.import || pkg.exports?.['.']?.main) {
    entryPath = path.join(nodeModulesPath, pkg.exports['.'].import || pkg.exports['.'].main)
  } else if (pkg.module) {
    entryPath = path.join(nodeModulesPath, pkg.module)
  } else if (pkg.main) {
    entryPath = path.join(nodeModulesPath, pkg.main)
  }
  if (!entryPath) {
    return null
  }
  const ext = path.extname(entryPath)
  if (ext === '.svelte') {
    const { js } = await compileSvelte(entryPath)
    const relPath = path.relative(process.cwd(), entryPath)
    const tmpFile = path.join(TMP_DIR, 'node_modules', relPath.replace(/\.svelte$/, '.svelte.js'))
    const tmpFileAbs = path.resolve(process.cwd(), tmpFile)
    await fs.mkdirp(path.dirname(tmpFile))
    await fs.writeFile(tmpFile, js.code)
    const sourceTmpFile = getTempFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, tmpFileAbs)
    return { filePath: entryPath, js: { code: js.code }, url: relativePath }
  }
  if (ext === '.js' || ext === '.ts') {
    const exports = await getSvelteExports(entryPath)
    if (exports.length > 0) {
      const barrelResult = await compileBarrel(entryPath, importChain)
      const sourceTmpFile = getTempFilePath(sourceFilePath)
      const fromDir = path.dirname(sourceTmpFile)
      const relativePath = computeRelativePath(fromDir, barrelResult.wrapperAbsPath)
      return { filePath: entryPath, js: barrelResult.js, url: relativePath }
    }
    const sourceTmpFile = getTempFilePath(sourceFilePath)
    const fromDir = path.dirname(sourceTmpFile)
    const relativePath = computeRelativePath(fromDir, entryPath)
    return { filePath: entryPath, js: { code: '' }, url: relativePath }
  }
  return null
}
