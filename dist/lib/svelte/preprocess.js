import is from '@magic/types'
import path from 'node:path'
import { getViteDefine } from './viteConfig/index.js'
import { getSvelteCompiler } from './compiler-cache.js'
const walk = (node, handlers) => {
  const visit = n => {
    if (!n || !is.object(n)) {
      return
    }
    const astNode = n
    if (astNode.type) {
      handlers.enter(astNode)
    }
    for (const key of Object.keys(n)) {
      if (key !== '_visited') {
        const val = n[key]
        visit(val)
      }
    }
  }
  visit(node)
}
const extractRuneVariables = async source => {
  const state = []
  const derived = []
  try {
    const { parse } = await getSvelteCompiler()
    const ast = parse(source, { modern: true })
    if (!ast.instance || !ast.instance.content) {
      return { state, derived }
    }
    walk(ast.instance.content, {
      enter(node) {
        if (node.type === 'VariableDeclaration') {
          const decls = node.declarations
          for (const decl of decls) {
            const d = decl
            const id = d.id
            if (id.type !== 'Identifier') {
              continue
            }
            const name = id.name
            const init = d.init
            if (!init) {
              continue
            }
            const initType = init.type
            if (initType === 'CallExpression') {
              const callee = init.callee
              if (callee.type === 'Identifier') {
                const calleeName = callee.name
                if (calleeName === '$state') {
                  state.push(name)
                } else if (calleeName === '$derived') {
                  derived.push(name)
                }
              }
            }
          }
        }
      },
    })
  } catch (e) {
    const err = is.error(e) ? e : new Error(String(e))
    console.warn('Failed to parse for test exports:', err.message)
  }
  return { state, derived }
}
export const testExportsPreprocessor = () => {
  return {
    name: 'magic-test-exports',
    script: async ({ content }) => {
      if (!content.includes('<script')) {
        return { code: content }
      }
      const { state, derived } = await extractRuneVariables(content)
      const toExport = [...state, ...derived]
      if (toExport.length === 0) {
        return { code: content }
      }
      const exportStatement = `\nexport { ${toExport.join(', ')} };\n`
      const scriptEnd = content.lastIndexOf('</script>')
      if (scriptEnd === -1) {
        return { code: content + exportStatement }
      }
      const newContent = content.slice(0, scriptEnd) + exportStatement + content.slice(scriptEnd)
      return { code: newContent }
    },
  }
}
export const viteDefinePreprocessor = () => {
  return {
    name: 'magic-vite-define',
    script: async ({ content, filename }) => {
      if (!filename) {
        return { code: content }
      }
      const defines = await getViteDefine(filename)
      if (!defines || Object.keys(defines).length === 0) {
        return { code: content }
      }
      const declarations = []
      for (const [key, value] of Object.entries(defines)) {
        const valueStr = is.string(value) ? value : String(value)
        declarations.push(`const ${key} = ${valueStr};`)
      }
      if (declarations.length === 0) {
        return { code: content }
      }
      const defineStatements = '\n' + declarations.join('\n') + '\n'
      if (!content.includes('<script')) {
        return { code: defineStatements + content }
      }
      const scriptEnd = content.lastIndexOf('</script>')
      if (scriptEnd === -1) {
        return { code: content + defineStatements }
      }
      const newContent = content.slice(0, scriptEnd) + defineStatements + content.slice(scriptEnd)
      return { code: newContent }
    },
  }
}
export const resolveNodeModulesRelativeImportsPreprocessor = () => {
  let savedFilename = undefined
  return {
    name: 'magic-resolve-node-modules-relative-imports',
    markup: async ({ content, filename }) => {
      savedFilename = filename
      return { content }
    },
    script: async ({ content, filename }) => {
      const fn = filename || savedFilename
      if (!fn || !fn.includes('node_modules')) {
        return { code: content }
      }
      const absolutePath = fn.startsWith('file://') ? fn.slice(7) : fn
      const resolvedPath = absolutePath.startsWith('/') ? absolutePath : path.resolve(absolutePath)
      const nodeModulesIndex = resolvedPath.indexOf('/node_modules/')
      if (nodeModulesIndex === -1) {
        return { code: content }
      }
      const afterNodeModules = resolvedPath.slice(nodeModulesIndex + 14)
      const dirPath = path.dirname(afterNodeModules)
      const pkgMatch = afterNodeModules.match(/^(@[^/]+\/[^/]+)\//)
      const pkgName = pkgMatch ? pkgMatch[1] + '/' : ''
      const relativeToPkg = dirPath.startsWith(pkgName) ? dirPath.slice(pkgName.length) : dirPath
      // Only transform bare '..' imports (directory barrel imports), not '../subpath'
      const hasDotDot = /from\s+['"]\.\.['"]/.test(content)
      if (!hasDotDot) {
        return { code: content }
      }
      const depth = relativeToPkg ? (relativeToPkg.match(/\//g) || []).length + 1 : 1
      const upPath = '../'.repeat(depth)
      const transformed = content.replace(/from\s+['"]\.\.['"]/g, `from '${upPath}index.js'`)
      return { code: transformed }
    },
  }
}
