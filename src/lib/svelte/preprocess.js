import { parse } from 'svelte/compiler'

/**
 * Simple AST walker for Svelte AST
 * @param {any} node - AST node
 * @param {{ enter: (n: any) => void }} handlers - Handlers
 */
const walk = (node, handlers) => {
  /** @param {any} n */
  const visit = n => {
    if (!n || typeof n !== 'object') return

    if (n.type) {
      handlers.enter(n)
    }

    for (const key of Object.keys(n)) {
      if (key !== '_visited') {
        visit(n[key])
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

    walk(ast.instance.content, {
      enter(node) {
        if (node.type === 'VariableDeclaration') {
          for (const decl of node.declarations) {
            if (decl.id.type !== 'Identifier') continue

            const name = decl.id.name
            const initType = decl.init?.type

            if (initType === 'CallExpression') {
              const callee = decl.init.callee
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
  } catch (/** @type {any} */ e) {
    console.warn('Failed to parse for test exports:', e.message)
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
