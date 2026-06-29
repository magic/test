import { getSvelteCompiler } from '../compiler-cache.ts'
import { LRUCache } from '../../caches/LRUCache.ts'
import type { TSESTree } from '@typescript-eslint/types'
import crypto from 'node:crypto'
import type { ExportInfo } from './types.ts'
import is from '@magic/types'
import { createRequire } from 'node:module'

const MAX_AST_CACHE_SIZE = 500

// Use createRequire for ESM compatibility when parsing inline code
const _require = createRequire(import.meta.url)

export type FileInfo = {
  code: string
  ast: TSESTree.Program
  filePath: string
  hasRunes?: boolean
  isCompiled?: boolean
}

// Analysis cache - single parse per unique code
type CodeAnalysis = {
  ast: TSESTree.Program
  hasRunes: boolean
  isCompiled: boolean
}

const analysisCache = new LRUCache<CodeAnalysis>(MAX_AST_CACHE_SIZE)

// Use LRUCache for consistent cache behavior
const astCache = new LRUCache<FileInfo>(MAX_AST_CACHE_SIZE)

export const clearAstCache = () => astCache.clear()

const getCacheKey = (code: string, filePath: string): string => {
  const hash = crypto.createHash('sha256').update(code).digest('hex')
  return `${filePath}:${hash}`
}

const extractScriptFromSvelte = async (source: string): Promise<string> => {
  try {
    const { parse: parseSvelte } = await getSvelteCompiler()

    const ast = parseSvelte(source, { modern: true })

    const parts: string[] = []

    const extractBody = (content: unknown): void => {
      if (!content || !is.object(content)) {
        return
      }
      const c = content as { body?: unknown[] }
      if (c.body && is.array(c.body)) {
        for (const node of c.body) {
          if (node && is.object(node) && 'start' in node && 'end' in node) {
            const n = node as { start: number; end: number }
            parts.push(source.slice(n.start, n.end))
          }
        }
      }
    }

    if (ast.module) {
      extractBody(ast.module.content)
    }

    if (ast.instance) {
      extractBody(ast.instance.content)
    }

    return parts.join('\n')
  } catch {
    return ''
  }
}

const analyzeCodeSync = (code: string): CodeAnalysis => {
  const { parse } = _require('@typescript-eslint/parser')
  const ast = parse(code, {
    sourceType: 'module',
    ecmaVersion: 'latest',
  })

  let hasRunes = false
  let isCompiled = false

  // Check for compiled Svelte at the top level: import * as $ from 'svelte/internal/'
  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      const imp = node as TSESTree.ImportDeclaration
      const nsSpec = imp.specifiers.find(s => s.type === 'ImportNamespaceSpecifier')
      if (nsSpec) {
        const spec = nsSpec as TSESTree.ImportNamespaceSpecifier
        if (spec.local.name === '$') {
          const source = imp.source as TSESTree.Literal
          if (is.string(source.value) && source.value.startsWith('svelte/internal')) {
            isCompiled = true
          }
        }
      }
    }
  }

  const checkNode = (node: TSESTree.Node): void => {
    // Check for Svelte runes: $state(), $derived(), etc.
    if (!hasRunes && node.type === 'CallExpression') {
      const callee = node.callee
      if (callee.type === 'Identifier' && callee.name.startsWith('$')) {
        if (SVELTE_RUNE_NAMES.has(callee.name)) {
          hasRunes = true
        }
      }
      // Handle $derived.by, $effect.pre, etc.
      if (callee.type === 'MemberExpression') {
        const obj = callee.object
        const prop = callee.property
        if (obj.type === 'Identifier' && obj.name.startsWith('$') && prop.type === 'Identifier') {
          const fullName = `${obj.name}.${prop.name}`
          if (SVELTE_RUNE_NAMES.has(fullName)) {
            hasRunes = true
          }
        }
      }
    }

    // Recurse only if we haven't found runes yet (isCompiled already checked at top level)
    if (!hasRunes) {
      for (const key of Object.keys(node)) {
        if (key === 'type' || key === 'loc' || key === 'range' || key === 'parent') {
          continue
        }
        const val = (node as unknown as Record<string, unknown>)[key]
        if (val && is.object(val)) {
          if ('type' in val) {
            checkNode(val as TSESTree.Node)
          } else if (is.array(val)) {
            for (const item of val) {
              if (item && is.object(item) && 'type' in (item as object)) {
                checkNode(item as TSESTree.Node)
              }
            }
          }
        }
      }
    }
  }

  for (const node of ast.body) {
    checkNode(node)
    if (hasRunes) {
      break
    }
  }

  return { ast, hasRunes, isCompiled }
}

const analyzeCode = (code: string): CodeAnalysis => {
  const cacheKey = code.slice(0, 1000)
  const cached = analysisCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const analysis = analyzeCodeSync(code)
  analysisCache.set(cacheKey, analysis)
  return analysis
}

const parseFile = async (code: string, filePath: string): Promise<FileInfo> => {
  const cacheKey = getCacheKey(code, filePath)
  const cached = astCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const isSvelte = filePath.endsWith('.svelte')
  const codeToParse = isSvelte ? await extractScriptFromSvelte(code) : code

  // Use cached analysis for rune/compiled detection
  const analysis = analyzeCode(codeToParse)

  const result: FileInfo = {
    code: codeToParse,
    ast: analysis.ast,
    filePath,
    hasRunes: analysis.hasRunes,
    isCompiled: analysis.isCompiled,
  }
  astCache.set(cacheKey, result)
  return result
}

const getOriginal = (node: TSESTree.Node, code: string): string => {
  return code.slice(node.range[0], node.range[1])
}

const getDeclarationNames = (decl: TSESTree.Node): string[] => {
  switch (decl.type) {
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      return decl.id && decl.id.type === 'Identifier' ? [decl.id.name] : []
    case 'TSDeclareFunction':
      return decl.id && decl.id.type === 'Identifier' ? [decl.id.name] : []
    case 'VariableDeclaration':
      return decl.declarations.flatMap(d => extractPatternNames(d.id, ''))
    case 'TSInterfaceDeclaration':
    case 'TSTypeAliasDeclaration':
      return decl.id && decl.id.type === 'Identifier' ? [decl.id.name] : []
    case 'TSEnumDeclaration':
      return decl.id && decl.id.type === 'Identifier' ? [decl.id.name] : []
    case 'TSModuleDeclaration':
      return decl.id && decl.id.type === 'Identifier' ? [decl.id.name] : []
    case 'TSTypeParameterDeclaration':
      return decl.params.map(p => ('name' in p && is.string(p.name) ? p.name : '')).filter(Boolean)
    default:
      return []
  }
}

const extractPatternNames = (
  pattern:
    TSESTree.Identifier | TSESTree.ArrayPattern | TSESTree.ObjectPattern | TSESTree.RestElement,
  _code: string,
): string[] => {
  if (pattern.type === 'Identifier') {
    return [pattern.name]
  }
  if (pattern.type === 'ArrayPattern') {
    return pattern.elements.flatMap(e =>
      e
        ? extractPatternNames(
            e as
              | TSESTree.Identifier
              | TSESTree.ArrayPattern
              | TSESTree.ObjectPattern
              | TSESTree.RestElement,
            _code,
          )
        : [],
    )
  }
  if (pattern.type === 'ObjectPattern') {
    return pattern.properties.flatMap(p => {
      if (p.type === 'RestElement') {
        return extractPatternNames(
          p.argument as
            | TSESTree.Identifier
            | TSESTree.ArrayPattern
            | TSESTree.ObjectPattern
            | TSESTree.RestElement,
          _code,
        )
      }
      if (p.type === 'Property') {
        return extractPatternNames(
          p.value as
            | TSESTree.Identifier
            | TSESTree.ArrayPattern
            | TSESTree.ObjectPattern
            | TSESTree.RestElement,
          _code,
        )
      }
      return []
    })
  }
  return []
}

const extractExports = (fileInfo: FileInfo): ExportInfo[] => {
  const { ast, code } = fileInfo
  const exports: ExportInfo[] = []

  for (const node of ast.body) {
    if (node.type === 'ExportNamedDeclaration') {
      const originalText = getOriginal(node, code)
      if (node.source) {
        for (const spec of node.specifiers) {
          if (spec.type === 'ExportSpecifier') {
            const localName = spec.local.type === 'Identifier' ? spec.local.name : ''
            const exportedName =
              spec.exported.type === 'Identifier' ? spec.exported.name : localName
            exports.push({
              name: localName,
              alias: exportedName !== localName ? exportedName : undefined,
              source: node.source.value,
              isType: node.exportKind === 'type',
              isDefault: false,
              isBatch: false,
              originalText,
            })
          }
        }
      } else if (node.declaration) {
        const names = getDeclarationNames(node.declaration)
        for (const name of names) {
          exports.push({
            name,
            source: null,
            isType: node.exportKind === 'type',
            isDefault: false,
            isBatch: false,
            originalText,
          })
        }
      } else if (node.specifiers.length > 0) {
        for (const spec of node.specifiers) {
          if (spec.type === 'ExportSpecifier') {
            const localName = spec.local.type === 'Identifier' ? spec.local.name : ''
            const exportedName =
              spec.exported.type === 'Identifier' ? spec.exported.name : localName
            exports.push({
              name: localName,
              alias: exportedName !== localName ? exportedName : undefined,
              source: null,
              isType: node.exportKind === 'type',
              isDefault: false,
              isBatch: false,
              originalText,
            })
          }
        }
      }
    } else if (node.type === 'ExportDefaultDeclaration') {
      exports.push({
        name: 'default',
        source: null,
        isType: false,
        isDefault: true,
        isBatch: false,
        originalText: getOriginal(node, code),
      })
    } else if (node.type === 'ExportAllDeclaration') {
      const alias =
        node.exported && node.exported.type === 'Identifier' ? node.exported.name : undefined
      exports.push({
        name: '*',
        alias,
        source: node.source.value,
        isType: node.exportKind === 'type',
        isDefault: false,
        isBatch: !alias,
        originalText: getOriginal(node, code),
      })
    } else if (node.type === 'TSExportAssignment') {
      exports.push({
        name: 'default',
        source: null,
        isType: false,
        isDefault: true,
        isBatch: false,
        originalText: getOriginal(node, code),
      })
    }
  }

  return exports
}

const getSpecifierString = (
  spec:
    TSESTree.ImportSpecifier | TSESTree.ImportDefaultSpecifier | TSESTree.ImportNamespaceSpecifier,
): string => {
  if (spec.type === 'ImportSpecifier') {
    const imported =
      spec.imported.type === 'Identifier' ? spec.imported.name : String(spec.imported.value || '')
    const local = spec.local.name
    return imported !== local ? `${imported} as ${local}` : local
  }
  if (spec.type === 'ImportDefaultSpecifier') {
    return `default as ${spec.local.name}`
  }
  if (spec.type === 'ImportNamespaceSpecifier') {
    return `* as ${spec.local.name}`
  }
  return ''
}

const findImportExpressions = (
  node: TSESTree.Node,
  code: string,
): Array<{ source: string; originalText: string }> => {
  const results: Array<{ source: string; originalText: string }> = []

  const walk = (n: TSESTree.Node): void => {
    if (n.type === 'ImportExpression') {
      const imp = n as TSESTree.ImportExpression
      const src = imp.source as TSESTree.Literal
      const source = is.string(src.value) ? src.value : ''
      results.push({
        source,
        originalText: getOriginal(n, code),
      })
    }

    for (const key of Object.keys(n)) {
      if (key === 'type' || key === 'loc' || key === 'range' || key === 'parent') {
        continue
      }
      const val = (n as unknown as Record<string, unknown>)[key]
      if (val && is.object(val) && 'type' in (val as object)) {
        walk(val as TSESTree.Node)
      } else if (is.array(val)) {
        for (const item of val) {
          if (item && is.object(item) && 'type' in (item as object)) {
            walk(item as TSESTree.Node)
          }
        }
      }
    }
  }

  walk(node)
  return results
}

const extractImports = (
  fileInfo: FileInfo,
): Array<{
  type: 'static' | 'dynamic' | 'sideEffect' | 'namespace'
  source: string
  specifiers: string[]
  originalText?: string
}> => {
  const { ast, code } = fileInfo
  const imports: Array<{
    type: 'static' | 'dynamic' | 'sideEffect' | 'namespace'
    source: string
    specifiers: string[]
    originalText?: string
  }> = []

  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      const specifiers = node.specifiers.map(s => getSpecifierString(s as never)).filter(Boolean)

      let type: 'static' | 'namespace' | 'sideEffect' = 'static'
      if (node.specifiers.some(s => s.type === 'ImportNamespaceSpecifier')) {
        type = 'namespace'
      } else if (specifiers.length === 0) {
        type = 'sideEffect'
      }

      imports.push({
        type,
        source: is.string(node.source.value) ? node.source.value : String(node.source.value || ''),
        specifiers,
        originalText: getOriginal(node, code),
      })
    } else if (node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') {
      // intentionally left blank.
    } else {
      const dynamicImports = findImportExpressions(node, code)
      for (const dyn of dynamicImports) {
        imports.push({
          type: 'dynamic',
          source: dyn.source,
          specifiers: [],
          originalText: dyn.originalText,
        })
      }
    }
  }

  return imports
}

// Types for simple import extraction (used by processImports)
export type SimpleImport = {
  specifiers: string // joined specifier string like "{ foo, bar }" or "* as name"
  source: string
  originalText: string
  type: 'static' | 'namespace' | 'sideEffect'
  start: number // start position in source code
  end: number // end position in source code
  localNames: string[] // extracted local import names (for default + named imports)
}

/**
 * Synchronously extract imports from code string.
 * Used by processImports for fast, regex-free import extraction.
 */
export const extractImportsSync = (code: string): SimpleImport[] => {
  try {
    const { parse } = _require('@typescript-eslint/parser')
    const ast = parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
    })

    const imports: SimpleImport[] = []

    for (const node of ast.body) {
      if (node.type === 'ImportDeclaration') {
        // Get original text for replacement
        const originalText = node.range ? code.slice(node.range[0], node.range[1]) : ''

        // Get source path
        const source = is.string(node.source.value)
          ? node.source.value
          : String(node.source.value || '')

        // Get specifier string
        let specifiers = ''
        let type: 'static' | 'namespace' | 'sideEffect' = 'static'
        const localNames: string[] = []

        const allSpecs = node.specifiers as Array<{ type: string; [key: string]: unknown }>
        if (allSpecs.length === 0) {
          type = 'sideEffect'
          specifiers = ''
        } else if (allSpecs.some(s => s.type === 'ImportNamespaceSpecifier')) {
          type = 'namespace'
          for (const spec of allSpecs) {
            if (spec.type === 'ImportNamespaceSpecifier') {
              specifiers = `* as ${(spec as unknown as TSESTree.ImportNamespaceSpecifier).local.name}`
              localNames.push((spec as unknown as TSESTree.ImportNamespaceSpecifier).local.name)
              break
            }
          }
        } else {
          type = 'static'
          const defaultImports: string[] = []
          const namedImports: string[] = []
          for (const spec of allSpecs) {
            if (spec.type === 'ImportSpecifier') {
              const s = spec as unknown as TSESTree.ImportSpecifier
              const imported = s.imported.type === 'Identifier' ? s.imported.name : ''
              const local = s.local.name
              localNames.push(local)
              namedImports.push(imported !== local ? `${imported} as ${local}` : local)
            } else if (spec.type === 'ImportDefaultSpecifier') {
              const s = spec as unknown as TSESTree.ImportDefaultSpecifier
              defaultImports.push(s.local.name)
              localNames.push(s.local.name)
            }
          }
          // Default imports don't get braces, named imports do
          // Mix default + named: default comes first, no braces for defaults
          if (namedImports.length > 0 && defaultImports.length > 0) {
            // Mixed: import default, { named } from
            specifiers = `{ ${namedImports.join(', ')} }`
          } else if (namedImports.length > 0) {
            // Only named imports
            specifiers = `{ ${namedImports.join(', ')} }`
          } else {
            // Only default imports
            specifiers = defaultImports.join(', ')
          }
        }

        imports.push({
          specifiers,
          source,
          originalText,
          type,
          start: node.range?.[0] ?? 0,
          end: node.range?.[1] ?? 0,
          localNames,
        })
      }
    }

    return imports
  } catch {
    return []
  }
}

export {
  extractScriptFromSvelte,
  parseFile,
  extractExports,
  getDeclarationNames,
  extractImports,
  getOriginal,
}

// Valid Svelte 5 rune names
const SVELTE_RUNE_NAMES = new Set([
  '$state',
  '$derived',
  '$effect',
  '$props',
  '$bindable',
  '$state.config',
  'effect.pre',
  'effect.post',
  'derived.by',
])

/**
 * Check if code contains Svelte 5 runes using AST parsing.
 * Returns false for already-compiled output (which also has rune calls).
 * Uses cached analysis for efficiency.
 */
export const hasSvelteRunes = (code: string): boolean => {
  try {
    const { hasRunes, isCompiled } = analyzeCode(code)
    // Compiled output contains runes but doesn't need re-processing
    return hasRunes && !isCompiled
  } catch {
    return false
  }
}

/**
 * Check if code is compiled Svelte output (has import * as $ from 'svelte/internal/')
 * Uses cached analysis for efficiency.
 */
export const isSvelteCompiled = (code: string): boolean => {
  try {
    return analyzeCode(code).isCompiled
  } catch {
    return false
  }
}

// Helper types for export analysis
export type SvelteReexportInfo = {
  source: string
  originalText: string
}

/**
 * Check if code re-exports from .svelte files.
 * Replaces: SVELTE_REEXPORT_REGEX and SVELTE_DEFAULT_REEXPORT_REGEX
 */
export const getSvelteReexports = (code: string): SvelteReexportInfo[] => {
  try {
    const { parse } = _require('@typescript-eslint/parser')
    const ast = parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
    })

    const reexports: SvelteReexportInfo[] = []

    for (const node of ast.body) {
      if (node.type === 'ExportNamedDeclaration' && node.source) {
        const source = node.source as TSESTree.Literal
        if (is.string(source.value) && source.value.endsWith('.svelte')) {
          reexports.push({
            source: source.value,
            originalText: code.slice(node.range[0], node.range[1]),
          })
        }
      } else if (node.type === 'ExportDefaultDeclaration') {
        // export default from './Foo.svelte' - TSExportAssignment is handled separately
      } else if (node.type === 'ExportAllDeclaration' && node.source) {
        const source = node.source as TSESTree.Literal
        if (is.string(source.value) && source.value.endsWith('.svelte')) {
          reexports.push({
            source: source.value,
            originalText: code.slice(node.range[0], node.range[1]),
          })
        }
      }
    }

    return reexports
  } catch {
    return []
  }
}

/**
 * Check if code has Svelte re-exports.
 * Replaces: SVELTE_REEXPORT_REGEX.test(content) || SVELTE_DEFAULT_REEXPORT_REGEX.test(content)
 */
export const hasSvelteReexports = (code: string): boolean => {
  return getSvelteReexports(code).length > 0
}

/**
 * Get all export * from targets.
 * Replaces: EXPORT_STAR_REGEX
 */
export const getExportStarTargets = (code: string): string[] => {
  try {
    const { parse } = _require('@typescript-eslint/parser')
    const ast = parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
    })

    const targets: string[] = []

    for (const node of ast.body) {
      if (node.type === 'ExportAllDeclaration' && node.source) {
        const source = node.source as TSESTree.Literal
        if (is.string(source.value)) {
          targets.push(source.value)
        }
      }
    }

    return targets
  } catch {
    return []
  }
}

/**
 * Check if code has export * from statements.
 * Replaces: EXPORT_STAR_REGEX.test(content)
 */
export const hasExportStar = (code: string): boolean => {
  return getExportStarTargets(code).length > 0
}

/**
 * Get all export { x } from targets (named re-exports).
 * Replaces: EXPORT_NAMED_REGEX
 */
export const getExportNamedTargets = (code: string): string[] => {
  try {
    const { parse } = _require('@typescript-eslint/parser')
    const ast = parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
    })

    const targets: string[] = []

    for (const node of ast.body) {
      if (node.type === 'ExportNamedDeclaration' && node.source) {
        const source = node.source as TSESTree.Literal
        if (is.string(source.value)) {
          targets.push(source.value)
        }
      }
    }

    return targets
  } catch {
    return []
  }
}
