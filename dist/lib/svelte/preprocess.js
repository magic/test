import { parse } from 'svelte/compiler'
import is from '@magic/types'
import { getViteDefine } from './viteConfig/index.js'
const walk = (node, handlers) => {
  const visit = n => {
    if (!n || !is.object(n)) return
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
const extractRuneVariables = source => {
  const state = []
  const derived = []
  try {
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
            if (id.type !== 'Identifier') continue
            const name = id.name
            const init = d.init
            if (!init) continue
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
      const { state, derived } = extractRuneVariables(content)
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
