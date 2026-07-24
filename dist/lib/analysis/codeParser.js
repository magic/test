import is from '@magic/types'
import { parse } from '@typescript-eslint/parser'
// Safely cast a value to TSESTree.Node after validation
const toNode = val => {
  if (is.objectNative(val) && is.string(val.type)) {
    return val
  }
  return undefined
}
// Recursively get all nodes from an AST
const getChildNodes = node => {
  const children = []
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'loc' || key === 'range' || key === 'parent') {
      continue
    }
    const val = node[key]
    if (is.array(val)) {
      for (const item of val) {
        const node = toNode(item)
        if (node) {
          children.push(node)
        }
      }
    } else {
      const node = toNode(val)
      if (node) {
        children.push(node)
      }
    }
  }
  return children
}
const getSpecifierName = spec => {
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
export const getImportNames = content => {
  const ast = parse(content, {
    sourceType: 'module',
    ecmaVersion: 'latest',
  })
  const names = []
  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      for (const spec of node.specifiers) {
        const name = getSpecifierName(spec)
        if (name) {
          names.push(name)
        }
      }
    }
  }
  return names
}
// Helper to check if a node accesses a member of an imported name
const checkMemberAccess = (node, importNameSet) => {
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
export const mutatesImportedState = (code, importNames) => {
  if (importNames.length === 0) {
    return false
  }
  const importNameSet = new Set(importNames)
  try {
    const ast = parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
    })
    const checkNode = node => {
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
      for (const child of getChildNodes(node)) {
        if (checkNode(child)) {
          return true
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
export const getPortPatterns = code => {
  const ports = []
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
export const getFilePaths = code => {
  const files = []
  const fsMethodMatch = code.match(/fs\.\w+\(\s*['"]([^'"]+)['"]/g)
  if (fsMethodMatch) {
    fsMethodMatch.forEach(match => {
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
