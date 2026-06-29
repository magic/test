import is from '@magic/types'
import { parse } from '@typescript-eslint/parser'
import type { TSESTree } from '@typescript-eslint/types'

type ImportSpecifier =
  TSESTree.ImportSpecifier | TSESTree.ImportDefaultSpecifier | TSESTree.ImportNamespaceSpecifier

const getSpecifierName = (spec: ImportSpecifier): string => {
  if (spec.type === 'ImportNamespaceSpecifier') {
    return spec.local.name
  }
  if (spec.type === 'ImportDefaultSpecifier') {
    return spec.local.name
  }
  // ImportSpecifier
  if (spec.imported.type === 'Identifier') {
    return spec.imported.name
  }
  return spec.local.name
}

export const getImportNames = (content: string): string[] => {
  const ast = parse(content, {
    sourceType: 'module',
    ecmaVersion: 'latest',
  })

  const names: string[] = []

  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      for (const spec of node.specifiers) {
        const name = getSpecifierName(spec as ImportSpecifier)
        if (name) {
          names.push(name)
        }
      }
    }
  }

  return names
}

// Helper to check if a node accesses a member of an imported name
const checkMemberAccess = (node: TSESTree.Node, importNameSet: Set<string>): boolean => {
  // Direct identifier: foo
  if (node.type === 'Identifier') {
    return importNameSet.has(node.name)
  }

  // Member expression: foo.bar, foo[0], foo['bar']
  if (node.type === 'MemberExpression') {
    const object = node.object
    // Check if the base object is an imported name
    if (object.type === 'Identifier' && importNameSet.has(object.name)) {
      return true
    }
    // Recurse for nested member expressions: foo.bar.baz
    return checkMemberAccess(object, importNameSet)
  }

  return false
}

export const mutatesImportedState = (code: string, importNames: string[]): boolean => {
  if (importNames.length === 0) {
    return false
  }

  const importNameSet = new Set(importNames)

  try {
    const ast = parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
    })

    const checkNode = (node: TSESTree.Node): boolean => {
      // Check for assignments: foo.bar = x, foo[0] = x, foo = x
      if (node.type === 'AssignmentExpression') {
        const left = node.left
        if (checkMemberAccess(left, importNameSet)) {
          return true
        }
      }

      // Check for update expressions: foo++, foo--
      if (node.type === 'UpdateExpression') {
        const argument = node.argument
        if (checkMemberAccess(argument, importNameSet)) {
          return true
        }
      }

      // Check for delete expressions: delete foo.bar
      if (node.type === 'UnaryExpression' && node.operator === 'delete') {
        const argument = node.argument
        if (checkMemberAccess(argument, importNameSet)) {
          return true
        }
      }

      // Recurse into children
      for (const key of Object.keys(node)) {
        if (key === 'type' || key === 'loc' || key === 'range' || key === 'parent') {
          continue
        }
        const val = (node as unknown as Record<string, unknown>)[key]
        if (val && typeof val === 'object') {
          if ('type' in (val as object)) {
            if (checkNode(val as TSESTree.Node)) {
              return true
            }
          } else if (is.array(val)) {
            for (const item of val) {
              if (item && typeof item === 'object' && 'type' in (item as object)) {
                if (checkNode(item as TSESTree.Node)) {
                  return true
                }
              }
            }
          }
        }
      }

      return false
    }

    for (const node of ast.body) {
      if (checkNode(node)) {
        return true
      }
    }

    return false
  } catch {
    return false
  }
}

export const getPortPatterns = (code: string): string[] => {
  const ports: string[] = []

  const listenMatch = code.match(/\.listen\(\s*(\d+)/g)
  if (listenMatch) {
    ports.push(...listenMatch)
  }

  const httpMatch = code.match(/port\s*:\s*(\d+)/g)
  if (httpMatch) {
    ports.push(...httpMatch)
  }

  const fetchMatch = code.match(/fetch\([^)]*localhost[,:]?(\d+)/g)
  if (fetchMatch) {
    ports.push(...fetchMatch)
  }

  const globalMatch = code.match(/globalThis\[\w*port\w*\]|globalThis\.\w*port\w*/gi)
  if (globalMatch) {
    ports.push(...globalMatch)
  }

  return ports
}

export const getFilePaths = (code: string): string[] => {
  const files: string[] = []

  const fsMethodMatch = code.match(/fs\.\w+\(\s*['"]([^'"]+)['"]/g)
  if (fsMethodMatch) {
    fsMethodMatch.forEach((match: string) => {
      const pathMatch = match.match(/['"]([^'"]+)['"]/)
      if (pathMatch && pathMatch[1]) {
        files.push(pathMatch[1])
      }
    })
  }

  const globalFileMatch = code.match(/globalThis\.\w+File\w*/gi)
  if (globalFileMatch) {
    files.push(...globalFileMatch)
  }

  return files
}
