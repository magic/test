export const getImportNames = content => {
  const namedImport = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g
  const defaultImport = /import\s+([a-zA-Z_$][\w$]*)\s+from\s*['"][^'"]+['"]/g
  const namespaceImport = /import\s*\*\s+as\s+([a-zA-Z_$][\w$]*)\s+from/g
  const names = []
  let match
  while ((match = namedImport.exec(content))) {
    if (match[1]) {
      match[1].split(',').forEach(n => names.push(n.trim()))
    }
  }
  while ((match = defaultImport.exec(content))) {
    if (match[1]) {
      names.push(match[1])
    }
  }
  while ((match = namespaceImport.exec(content))) {
    if (match[1]) {
      names.push(match[1])
    }
  }
  return names
}
export const mutatesImportedState = (code, importNames) => {
  const mutationPatterns = importNames.map(name => {
    const nameEscaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(
      `${nameEscaped}(?:\\[[^\\]]+\\]|\\.[a-zA-Z_$][\\w$]*)\\s*=|delete\\s+${nameEscaped}`,
    )
  })
  return mutationPatterns.some(re => re.test(code))
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
