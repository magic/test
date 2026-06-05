import { parse } from '@typescript-eslint/parser'
import type { TSESTree } from '@typescript-eslint/types'
import { parse as parseSvelte } from 'svelte/compiler'
import crypto from 'node:crypto'
import type { ExportInfo } from './types.ts'
import is from '@magic/types'

export type FileInfo = {
  code: string
  ast: TSESTree.Program
  filePath: string
}

const astCache = new Map<string, FileInfo>()

export const clearAstCache = () => astCache.clear()

const getCacheKey = (code: string, filePath: string): string => {
  const hash = crypto.createHash('sha256').update(code).digest('hex')
  return `${filePath}:${hash}`
}

const extractScriptFromSvelte = (source: string): string => {
  try {
    const ast = parseSvelte(source, { modern: true })

    const parts: string[] = []

    const extractBody = (content: unknown): void => {
      if (!content || !is.object(content)) {
        return
      }
      const c = content as { body?: unknown[] }
      if (c.body && Array.isArray(c.body)) {
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

const parseFile = (code: string, filePath: string): FileInfo => {
  const cacheKey = getCacheKey(code, filePath)
  const cached = astCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const isSvelte = filePath.endsWith('.svelte')
  const codeToParse = isSvelte ? extractScriptFromSvelte(code) : code

  const ast = parse(codeToParse, {
    sourceType: 'module',
    ecmaVersion: 'latest',
    range: true,
  })

  const result: FileInfo = { code: codeToParse, ast, filePath }
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
    | TSESTree.Identifier
    | TSESTree.ArrayPattern
    | TSESTree.ObjectPattern
    | TSESTree.RestElement,
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
      exports.push({
        name: '*',
        source: node.source.value,
        isType: node.exportKind === 'type',
        isDefault: false,
        isBatch: true,
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
    | TSESTree.ImportSpecifier
    | TSESTree.ImportDefaultSpecifier
    | TSESTree.ImportNamespaceSpecifier,
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
      } else if (Array.isArray(val)) {
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

export {
  extractScriptFromSvelte,
  parseFile,
  extractExports,
  getDeclarationNames,
  extractImports,
  getOriginal,
}
