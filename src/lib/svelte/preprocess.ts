import { parse } from 'svelte/compiler'
import is from '@magic/types'

import { getViteDefine } from './viteConfig/index.js'

type ASTNode = { [key: string]: unknown; type: string }

interface IdentifierNode extends ASTNode {
  name: string
}

const walk = (node: unknown, handlers: { enter: (n: ASTNode) => void }): void => {
  const visit = (n: unknown): void => {
    if (!n || !is.object(n)) return

    const astNode = n as ASTNode
    if (astNode.type) {
      handlers.enter(astNode)
    }

    for (const key of Object.keys(n as object)) {
      if (key !== '_visited') {
        const val = (n as Record<string, unknown>)[key]
        visit(val)
      }
    }
  }

  visit(node)
}

const extractRuneVariables = (source: string): { state: string[]; derived: string[] } => {
  const state: string[] = []
  const derived: string[] = []

  try {
    const ast = parse(source, { modern: true })

    if (!ast.instance || !ast.instance.content) {
      return { state, derived }
    }

    walk(ast.instance.content as unknown, {
      enter(node) {
        if (node.type === 'VariableDeclaration') {
          const decls = node.declarations as unknown[]
          for (const decl of decls) {
            const d = decl as ASTNode
            const id = d.id as ASTNode
            if (id.type !== 'Identifier') continue

            const name = (id as IdentifierNode).name
            const init = d.init as ASTNode | null
            if (!init) continue
            const initType = init.type

            if (initType === 'CallExpression') {
              const callee = init.callee as ASTNode
              if (callee.type === 'Identifier') {
                const calleeName = (callee as IdentifierNode).name
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
    script: async ({
      content,
    }: {
      content: string
      attributes?: Record<string, string | boolean>
      markup?: string
      filename?: string
    }) => {
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
    script: async ({
      content,
      filename,
    }: {
      content: string
      attributes?: Record<string, string | boolean>
      markup?: string
      filename?: string
    }) => {
      if (!filename) {
        return { code: content }
      }

      const defines = await getViteDefine(filename)

      if (!defines || Object.keys(defines).length === 0) {
        return { code: content }
      }

      const declarations: string[] = []

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
