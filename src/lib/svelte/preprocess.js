import { parse } from 'svelte/compiler'
import is from '@magic/types'

import { getViteDefine } from './vite-config.js'

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

      // Mock $app/state page import - create simple object that won't be shadowed
      processed = processed.replace(
        /import\s+\{[^}]*\bpage\b[^}]*\}\s+from\s+['"]\$app\/state['"]/g,
        "const page = { url: { origin: 'http://localhost' } }",
      )

      // Mock @systemkollektiv/i18n imports - localizeHref adds trailing slash to http URLs
      processed = processed.replace(
        /import\s+\{[^}]*\}\s+from\s+['"]@systemkollektiv\/i18n['"]/g,
        "const localizeHref = (/** @type {string} */ href) => href && href.startsWith('http') && !href.endsWith('/') ? href + '/' : href || ''\nconst reroute = /** @type {any} */ (x => x)",
      )

      // Mock svelte-easy-crop - this package has unusual exports that Node can't resolve directly
      processed = processed.replace(
        /import\s+\{[^}]*\bImageCrop\b[^}]*\}\s+from\s+['"]svelte-easy-crop['"]/g,
        'const ImageCrop = /** @type {any} */ (() => ({ default: () => ({}) }))',
      )
      processed = processed.replace(
        /import\s+\{[^}]*\}\s+from\s+['"]svelte-easy-crop['"]/g,
        'const svelte_easy_crop = { ImageCrop: () => ({}) }',
      )
      processed = processed.replace(
        /import\s+(\w+)\s+from\s+['"]svelte-easy-crop['"]/g,
        'const $1 = /** @type {any} */ (() => ({ default: () => ({}) }))',
      )

      // Mock other common problematic packages
      processed = processed.replace(
        /import\s+\{[^}]*\}\s+from\s+['"]svelte['"]/g,
        'const svelte = { onMount: () => {}, onDestroy: () => {}, createEventDispatcher: () => ({ dispatch: () => {} }), getContext: () => {}, setContext: () => {}, hasContext: () => false, writable: (val) => ({ subscribe: () => {}, set: () => {}, update: () => {} }), derived: () => ({ subscribe: () => {} }) }',
      )

      return { code: processed }
    },
  }
}

export const viteDefinePreprocessor = () => {
  return {
    name: 'magic-vite-define',
    /** @param {{ content: string, filename?: string }} params */
    script: async ({ content, filename }) => {
      if (!filename) {
        return { code: content }
      }

      const defines = await getViteDefine(filename)

      if (!defines || Object.keys(defines).length === 0) {
        return { code: content }
      }

      /** @type {string[]} */
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
