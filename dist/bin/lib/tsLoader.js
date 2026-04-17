import fs from '@magic/fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveViteAlias } from '../../lib/svelte/viteConfig/resolveViteAlias.js'
export async function resolve(specifier, context, nextResolve) {
  try {
    if (specifier.endsWith('.js') && context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      const jsPath = path.resolve(parentDir, specifier)
      const tsPath = jsPath.slice(0, -3) + '.ts'
      if ((await fs.exists(tsPath)) && !(await fs.exists(jsPath))) {
        return nextResolve(specifier.replace(/\.js$/, '.ts'), context)
      }
    }
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
    if (specifier.endsWith('.svelte') && context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      const resolvedPath = path.resolve(parentDir, specifier)
      if (await fs.exists(resolvedPath)) {
        const { compileSvelteWithWrite } = await import('../../lib/svelte/compile/index.js')
        const { importUrl } = await compileSvelteWithWrite(resolvedPath)
        return { url: importUrl, shortCircuit: true }
      }
    }
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
        if (pkg.exports?.['.']?.main || pkg.exports?.['.']?.import) {
          const mainPath = pkg.exports['.'].main || pkg.exports['.'].import
          const resolvedPath = path.join(nodeModulesPath, mainPath)
          if (await fs.exists(resolvedPath)) {
            return { url: pathToFileURL(resolvedPath).href, shortCircuit: true }
          }
        }
        if (pkg.exports?.['.']?.svelte) {
          const sveltePath = path.join(nodeModulesPath, pkg.exports['.'].svelte)
          if (await fs.exists(sveltePath)) {
            const { compileSvelteWithWrite } = await import('../../lib/svelte/compile/index.js')
            const { importUrl } = await compileSvelteWithWrite(sveltePath)
            return { url: importUrl, shortCircuit: true }
          }
        }
        if (pkg.exports) {
          for (const [key, val] of Object.entries(pkg.exports)) {
            if (key !== '.' && typeof val === 'string') {
              const exportPath = path.join(nodeModulesPath, val)
              if (await fs.exists(exportPath)) {
                if (exportPath.endsWith('.svelte')) {
                  const { compileSvelteWithWrite } =
                    await import('../../lib/svelte/compile/index.js')
                  const { importUrl } = await compileSvelteWithWrite(exportPath)
                  return { url: importUrl, shortCircuit: true }
                }
                if (exportPath.endsWith('.js')) {
                  return { url: pathToFileURL(exportPath).href, shortCircuit: true }
                }
              }
            }
          }
        }
      }
    }
    if (!specifier.startsWith('@') && specifier.includes('/') && context.parentURL) {
      const parts = specifier.split('/')
      const packageName = parts[0]
      if (!packageName) {
        return nextResolve(specifier, context)
      }
      const nodeModulesPath = path.join(process.cwd(), 'node_modules', packageName)
      const pkgPath = path.join(nodeModulesPath, 'package.json')
      if (await fs.exists(pkgPath)) {
        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
        if (pkg.exports?.['.']?.main || pkg.exports?.['.']?.import) {
          const mainPath = pkg.exports['.'].main || pkg.exports['.'].import
          const resolvedPath = path.join(nodeModulesPath, mainPath)
          if (await fs.exists(resolvedPath)) {
            return { url: pathToFileURL(resolvedPath).href, shortCircuit: true }
          }
        }
        if (pkg.exports?.['.']?.svelte) {
          const sveltePath = path.join(nodeModulesPath, pkg.exports['.'].svelte)
          if (await fs.exists(sveltePath)) {
            const { compileSvelteWithWrite } = await import('../../lib/svelte/compile/index.js')
            const { importUrl } = await compileSvelteWithWrite(sveltePath)
            return { url: importUrl, shortCircuit: true }
          }
        }
        if (pkg.exports) {
          for (const [key, val] of Object.entries(pkg.exports)) {
            if (key !== '.' && typeof val === 'string') {
              const exportPath = path.join(nodeModulesPath, val)
              if (await fs.exists(exportPath)) {
                if (exportPath.endsWith('.svelte')) {
                  const { compileSvelteWithWrite } =
                    await import('../../lib/svelte/compile/index.js')
                  const { importUrl } = await compileSvelteWithWrite(exportPath)
                  return { url: importUrl, shortCircuit: true }
                }
                if (exportPath.endsWith('.js')) {
                  return { url: pathToFileURL(exportPath).href, shortCircuit: true }
                }
              }
            }
          }
        }
      }
    }
    if (specifier.startsWith('.') && specifier.endsWith('.svelte')) {
      if (context.parentURL) {
        const parentDir = path.dirname(new URL(context.parentURL).pathname)
        const svelteJsPath = path.resolve(parentDir, specifier + '.js')
        if (await fs.exists(svelteJsPath)) {
          return { url: pathToFileURL(svelteJsPath).href, shortCircuit: true }
        }
      }
    }
    if (
      specifier.startsWith('.') &&
      !specifier.endsWith('.ts') &&
      !specifier.endsWith('.js') &&
      !specifier.endsWith('.mjs') &&
      !specifier.endsWith('.svelte')
    ) {
      if (context.parentURL) {
        const parentDir = path.dirname(new URL(context.parentURL).pathname)
        const svelteJsPath = path.resolve(parentDir, specifier + '.svelte.js')
        if (await fs.exists(svelteJsPath)) {
          return { url: pathToFileURL(svelteJsPath).href, shortCircuit: true }
        }
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
  return nextResolve(specifier, context)
}
export async function load(url, context, nextLoad) {
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
