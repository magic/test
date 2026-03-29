import { parse } from 'svelte/compiler'
import is from '@magic/types'

/**
 * @typedef {{ [key: string]: unknown; type: string }} ASTNode
 */

/**
 * Simple AST walker for Svelte AST
 * @param {unknown} node - AST node
 * @param {{ enter: (n: ASTNode) => void }} handlers - Handlers
 */
const walk = (node, handlers) => {
  /** @param {unknown} n */
  const visit = n => {
    if (!n || !is.object(n)) return

    const astNode = /** @type {ASTNode} */ (n)
    if (astNode.type) {
      handlers.enter(astNode)
    }

    for (const key of Object.keys(n)) {
      if (key !== '_visited') {
        const val = /** @type {Record<string, unknown>} */ (n)[key]
        visit(val)
      }
    }
  }

  visit(node)
}

/**
 * Extract $state and $derived variables from Svelte source
 * @param {string} source - Svelte component source code
 * @returns {{ state: string[], derived: string[] }}
 */
const extractRuneVariables = source => {
  /** @type {string[]} */
  const state = []
  /** @type {string[]} */
  const derived = []

  try {
    const ast = parse(source, { modern: true })

    if (!ast.instance || !ast.instance.content) {
      return { state, derived }
    }

    walk(/** @type {unknown} */ (ast.instance.content), {
      enter(node) {
        const n = /** @type {ASTNode} */ (/** @type {unknown} */ (node))
        if (n.type === 'VariableDeclaration') {
          for (const decl of /** @type {Array<unknown>} */ (n.declarations)) {
            const d = /** @type {ASTNode} */ (decl)
            const id = /** @type {ASTNode} */ (d.id)
            if (id.type !== 'Identifier') continue

            const name = /** @type {{ name: string }} */ (/** @type {unknown} */ (id)).name
            const init = /** @type {ASTNode | null} */ (d.init)
            if (!init) continue
            const initType = init.type

            if (initType === 'CallExpression') {
              const callee = /** @type {ASTNode} */ (init.callee)
              if (callee.type === 'Identifier') {
                const calleeName = /** @type {{ name: string }} */ (/** @type {unknown} */ (callee))
                  .name
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
  } catch (/** @type {unknown} */ e) {
    const err = /** @type {Error} */ (e)
    console.warn('Failed to parse for test exports:', err.message)
  }

  return { state, derived }
}

export const testExportsPreprocessor = () => {
  return {
    name: 'magic-test-exports',
    /** @param {{ content: string }} params */
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

export const sveltekitMocksPreprocessor = () => {
  return {
    name: 'magic-sveltekit-mocks',
    /** @param {{ content: string }} params */
    script: async ({ content }) => {
      let processed = content.replace(
        /import\s+\{[^}]*\b(browser|dev|prod)\b[^}]*\}\s+from\s+['"]\$app\/environment['"]/g,
        "import { browser, dev, prod } from '@magic/test'",
      )

      processed = processed.replace(
        /import\s+\{[^}]*\bpage\b[^}]*\}\s+from\s+['"]\$app\/state['"]/g,
        "import { page } from '@magic/test'",
      )

      return { code: processed }
    },
  }
}
