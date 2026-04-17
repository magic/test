import fs from '@magic/fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveViteAlias } from '../../lib/svelte/viteConfig/resolveViteAlias.js'
export async function resolve(specifier, context, nextResolve) {
  // console.error('[resolve] called:', specifier.slice(0, 40))
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
          return { url: pathToFileURL(aliasResolved).href, shortCircuit: true }
        }
      } catch {
        // ignore
      }
    }
    // Handle .svelte files
    if (specifier.endsWith('.svelte') && context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      const resolvedPath = path.resolve(parentDir, specifier)
      if (await fs.exists(resolvedPath)) {
        const { compileSvelteWithWrite } = await import('../../lib/svelte/compile/index.js')
        const { importUrl } = await compileSvelteWithWrite(resolvedPath)
        return { url: importUrl, shortCircuit: true }
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
            const { compileSvelteWithWrite } = await import('../../lib/svelte/compile/index.js')
            const { importUrl } = await compileSvelteWithWrite(sveltePath)
            return { url: importUrl, shortCircuit: true }
          }
        }
        if (pkg.exports) {
          for (const [key, val] of Object.entries(pkg.exports)) {
            if (key !== '.' && typeof val === 'string' && val.endsWith('.js')) {
              const jsPath = path.join(nodeModulesPath, val)
              if (await fs.exists(jsPath)) {
                return { url: pathToFileURL(jsPath).href, shortCircuit: true }
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
        if (await fs.exists(sveltePath)) {
          const { compileSvelteWithWrite } = await import('../../lib/svelte/compile/index.js')
          const { importUrl } = await compileSvelteWithWrite(sveltePath)
          return { url: importUrl, shortCircuit: true }
        }
      }
    }
  } catch {
    // fall through
  }
  // Always pass through to nextResolve to avoid shortCircuit error
  return nextResolve(specifier, context)
}
export async function load(url, context, nextLoad) {
  // Handle .js -> .ts conversion for magic/test source files
  if (url.includes('/magic/util/test/src/') && url.endsWith('.js')) {
    const tsUrl = url.replace(/\.js$/, '.ts')
    const filePath = tsUrl.replace('file://', '')
    if (await fs.exists(filePath)) {
      const source = await fs.readFile(filePath, 'utf-8')
      return { format: 'module', source, shortCircuit: true }
    }
  }
  return nextLoad(url, context)
}
