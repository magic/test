import fs from '@magic/fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveViteAlias } from '../../lib/svelte/viteConfig/resolveViteAlias.ts'
import is from '@magic/types'
import ts from 'typescript'
import log from '@magic/log'

export const resolve = async (
  specifier: string,
  context: { parentURL?: string },
  nextResolve: (specifier: string, context?: object) => Promise<{ url: string }>,
): Promise<{ url: string; shortCircuit?: boolean }> => {
  try {
    // Handle .js -> .ts conversion for imports without compiled JS
    if (specifier.endsWith('.js') && context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      const jsPath = path.resolve(parentDir, specifier)
      const tsPath = jsPath.slice(0, -3) + '.ts'
      if ((await fs.exists(tsPath)) && !(await fs.exists(jsPath))) {
        return nextResolve(specifier.replace(/\.js$/, '.ts'), context)
      }
    }

    // Try alias resolution
    if (context.parentURL) {
      try {
        const aliasResolved = await resolveViteAlias(specifier, new URL(context.parentURL).pathname)
        if (aliasResolved) {
          // Check if resolved path exists, try extensions if not
          const withExtensions = ['', '.ts', '.svelte.ts', '.js', '/index.ts', '/index.js']
          for (const ext of withExtensions) {
            if (await fs.exists(aliasResolved + ext)) {
              return { url: pathToFileURL(aliasResolved + ext).href, shortCircuit: true }
            }
          }
          return { url: pathToFileURL(aliasResolved).href, shortCircuit: true }
        }
      } catch (e) {
        log.error('Error', e)
      }
    }

    // Handle .svelte files
    if (specifier.endsWith('.svelte') && context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      const resolvedPath = path.resolve(parentDir, specifier)
      if (await fs.exists(resolvedPath)) {
        const { compileSvelteWithWrite } = await import('../../lib/svelte/compile/index.ts')
        const { importUrl } = await compileSvelteWithWrite(resolvedPath)
        return { url: importUrl, shortCircuit: true }
      }
    }

    // Handle .svelte.js files with Svelte 5 runes
    if (specifier.endsWith('.svelte.js') && context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      const resolvedPath = path.resolve(parentDir, specifier)
      if (await fs.exists(resolvedPath)) {
        const source = await fs.readFile(resolvedPath, 'utf-8')
        const hasRune = /\$(?:state|derived|effect|props|bindable)\b/.test(source)
        if (hasRune) {
          try {
            const { compileModule } = await import('svelte/compiler')
            const result = compileModule(source, { filename: resolvedPath })
            const { writeTempFile } =
              await import('../../lib/svelte/compile/resolveSvelteOnlyExports.ts')
            const { processImports } = await import('../../lib/svelte/compile/processImports.ts')
            const { transformForNode } =
              await import('../../lib/svelte/compile/transformForNode.ts')
            const jsCode = String(result.js.code)
            const processed = await processImports(jsCode, resolvedPath)
            const transformed = transformForNode(processed, resolvedPath)
            const importUrl = pathToFileURL(await writeTempFile(resolvedPath, transformed)).href
            return { url: importUrl, shortCircuit: true }
          } catch {
            // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
            // Fall through to let Node.js handle it
          }
        }
      }
    }

    // Handle scoped packages (non-magic)
    if (specifier.startsWith('@') && specifier.includes('/') && context.parentURL) {
      if (specifier.startsWith('@magic/')) {
        return nextResolve(specifier, context)
      }
      const parts = specifier.split('/')
      const packageName = parts[0] + '/' + parts[1]
      const nodeModulesPath = path.join(process.cwd(), 'node_modules', packageName)
      const pkgPath = path.join(nodeModulesPath, 'package.json')

      if (await fs.exists(pkgPath)) {
        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))

        if (pkg.exports?.['.']?.svelte && !pkg.exports?.['.']?.import) {
          const sveltePath = path.join(nodeModulesPath, pkg.exports['.'].svelte)
          if (await fs.exists(sveltePath)) {
            const { compileSvelteWithWrite } = await import('../../lib/svelte/compile/index.ts')
            const { importUrl } = await compileSvelteWithWrite(sveltePath)
            return { url: importUrl, shortCircuit: true }
          }
        }

        if (pkg.exports) {
          const parts = specifier.split('/')
          const subpath = parts.slice(2).join('/')
          for (const [key, val] of Object.entries(pkg.exports)) {
            if (key !== '.' && is.str(val)) {
              const keyWithoutExt = key.replace(/\.js$/, '').replace(/\.mjs$/, '')
              const subpathWithoutExt = subpath.replace(/\.js$/, '').replace(/\.mjs$/, '')
              if (
                key === `./${subpath}` ||
                key === `./${subpath}.js` ||
                keyWithoutExt === `./${subpathWithoutExt}`
              ) {
                const jsPath = path.join(nodeModulesPath, val)
                if (await fs.exists(jsPath)) {
                  return { url: pathToFileURL(jsPath).href, shortCircuit: true }
                }
              }
            }
          }
        }
      }
    }

    // Handle relative imports without extension - check .svelte
    if (
      specifier.startsWith('.') &&
      !specifier.endsWith('.ts') &&
      !specifier.endsWith('.js') &&
      !specifier.endsWith('.mjs')
    ) {
      if (context.parentURL) {
        const parentDir = path.dirname(new URL(context.parentURL).pathname)
        const sveltePath = path.resolve(parentDir, specifier + '.svelte')
        const svelteTsPath = path.resolve(parentDir, specifier + '.svelte.ts')
        const svelteJsPath = path.resolve(parentDir, specifier + '.svelte.js')

        const sveltePathExists = await fs.exists(sveltePath)
        const svelteTsPathExists = await fs.exists(svelteTsPath)
        const svelteJsPathExists = await fs.exists(svelteJsPath)

        let finalSveltePath: string | undefined = undefined

        if (sveltePathExists) {
          finalSveltePath = sveltePath
        } else if (svelteTsPathExists) {
          finalSveltePath = svelteTsPath
        } else if (svelteJsPathExists) {
          finalSveltePath = svelteJsPath
        }

        if (finalSveltePath) {
          const { compileSvelteWithWrite } = await import('../../lib/svelte/compile/index.ts')
          const { importUrl } = await compileSvelteWithWrite(finalSveltePath)
          return { url: importUrl, shortCircuit: true }
        }

        const tsPath = path.resolve(parentDir, specifier + '.ts')
        const jsPath = path.resolve(parentDir, specifier + '.js')
        if (await fs.exists(tsPath)) {
          return { url: pathToFileURL(tsPath).href, shortCircuit: true }
        }
        if (await fs.exists(jsPath)) {
          return { url: pathToFileURL(jsPath).href, shortCircuit: true }
        }
      }
    }
  } catch (e) {
    // fall through
    log.error('Error resolving file', e)
  }

  return nextResolve(specifier, context)
}

const transpileWithTypeScript = (code: string): string => {
  const result = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
    reportDiagnostics: false,
  })
  return result.outputText
}

const resolveDollarLibImports = async (code: string, filePath: string): Promise<string> => {
  const dollarImportRe = /from\s+['"]($lib[^'"]*|$app[^'"]*)['"]/g
  let match
  const replacements: Array<{ original: string; replacement: string }> = []

  while ((match = dollarImportRe.exec(code)) !== null) {
    const fullMatch = match[0]
    const importPath = match[1]
    if (!importPath) {
      continue
    }

    const parentDir = path.dirname(filePath)
    const resolved = await resolveViteAlias(importPath, parentDir)
    if (resolved) {
      const withExtensions = [resolved, resolved + '.ts', resolved + '.svelte.ts', resolved + '.js']
      let foundPath = resolved
      for (const p of withExtensions) {
        if (await fs.exists(p)) {
          foundPath = p
          break
        }
      }
      replacements.push({
        original: fullMatch,
        replacement: `from '${pathToFileURL(foundPath).href}'`,
      })
    }
  }

  for (const { original, replacement } of replacements) {
    code = code.replace(original, replacement)
  }
  return code
}

export const load = async (
  url: string,
  context: { format?: string },
  nextLoad: (url: string, context?: object) => Promise<{ format?: string; source?: string }>,
): Promise<{ format?: string; source?: string; shortCircuit?: boolean }> => {
  if (url.includes('/magic/util/test/src/') && url.endsWith('.js')) {
    const tsUrl = url.replace(/\.js$/, '.ts')
    const filePath = tsUrl.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')
      return { format: 'module', source, shortCircuit: true }
    }
  }

  if (url.endsWith('.svelte.ts')) {
    const filePath = url.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')
      const withResolvedImports = await resolveDollarLibImports(source, filePath)
      const transpiled = transpileWithTypeScript(withResolvedImports)
      const { compileModule } = await import('svelte/compiler')

      try {
        const result = compileModule(transpiled, { filename: filePath })
        return { format: 'module', source: result.js.code, shortCircuit: true }
      } catch {
        // Pre-compiled Svelte files may contain `import * as $` which Svelte 5 rejects
        // Fall back to TypeScript transpilation only
        return { format: 'module', source: transpiled, shortCircuit: true }
      }
    }
  }

  if (url.endsWith('.ts') && !url.includes('/magic/util/test/src/')) {
    const filePath = url.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')
      const withResolvedImports = await resolveDollarLibImports(source, filePath)
      const transpiled = transpileWithTypeScript(withResolvedImports)
      return { format: 'module', source: transpiled, shortCircuit: true }
    }
  }

  if (url.endsWith('.mjs')) {
    const filePath = url.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')

      const hasTypeScript =
        source.includes('import type') ||
        source.includes(' as const') ||
        source.includes(' as ') ||
        source.includes('satisfies') ||
        source.includes('declare ')

      if (hasTypeScript) {
        const transpiled = transpileWithTypeScript(source)
        return { format: 'module', source: transpiled, shortCircuit: true }
      }
    }
  }

  if (url.endsWith('.css')) {
    return { format: 'module', source: 'export default ""', shortCircuit: true }
  }

  return nextLoad(url, context)
}
