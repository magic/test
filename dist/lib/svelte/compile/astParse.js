import { parse } from '@typescript-eslint/parser'
import crypto from 'node:crypto'
import is from '@magic/types'
const astCache = new Map()
export const clearAstCache = () => astCache.clear()
const getCacheKey = (code, filePath) => {
  const hash = crypto.createHash('sha256').update(code).digest('hex')
  return `${filePath}:${hash}`
}
const extractScriptFromSvelte = async source => {
  try {
    const { parse: parseSvelte } = await import('svelte/compiler')
    const ast = parseSvelte(source, { modern: true })
    const parts = []
    const extractBody = content => {
      if (!content || !is.object(content)) {
        return
      }
      const c = content
      if (c.body && Array.isArray(c.body)) {
        for (const node of c.body) {
          if (node && is.object(node) && 'start' in node && 'end' in node) {
            const n = node
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
const parseFile = async (code, filePath) => {
  const cacheKey = getCacheKey(code, filePath)
  const cached = astCache.get(cacheKey)
  if (cached) {
    return cached
  }
  const isSvelte = filePath.endsWith('.svelte')
  const codeToParse = isSvelte ? await extractScriptFromSvelte(code) : code
  const ast = parse(codeToParse, {
    sourceType: 'module',
    ecmaVersion: 'latest',
    range: true,
  })
  const result = { code: codeToParse, ast, filePath }
  astCache.set(cacheKey, result)
  return result
}
const getOriginal = (node, code) => {
  return code.slice(node.range[0], node.range[1])
}
const getDeclarationNames = decl => {
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
const extractPatternNames = (pattern, _code) => {
  if (pattern.type === 'Identifier') {
    return [pattern.name]
  }
  if (pattern.type === 'ArrayPattern') {
    return pattern.elements.flatMap(e => (e ? extractPatternNames(e, _code) : []))
  }
  if (pattern.type === 'ObjectPattern') {
    return pattern.properties.flatMap(p => {
      if (p.type === 'RestElement') {
        return extractPatternNames(p.argument, _code)
      }
      if (p.type === 'Property') {
        return extractPatternNames(p.value, _code)
      }
      return []
    })
  }
  return []
}
const extractExports = fileInfo => {
  const { ast, code } = fileInfo
  const exports = []
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
const getSpecifierString = spec => {
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
const findImportExpressions = (node, code) => {
  const results = []
  const walk = n => {
    if (n.type === 'ImportExpression') {
      const imp = n
      const src = imp.source
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
      const val = n[key]
      if (val && is.object(val) && 'type' in val) {
        walk(val)
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (item && is.object(item) && 'type' in item) {
            walk(item)
          }
        }
      }
    }
  }
  walk(node)
  return results
}
const extractImports = fileInfo => {
  const { ast, code } = fileInfo
  const imports = []
  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      const specifiers = node.specifiers.map(s => getSpecifierString(s)).filter(Boolean)
      let type = 'static'
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
