import is from '@magic/types'
const getImportNames = content => {
  const namedImport = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g
  const defaultImport = /import\s+([a-zA-Z_$][\w$]*)\s+from\s*['"][^'"]+['"]/g
  const namespaceImport = /import\s*\*\s+as\s+([a-zA-Z_$][\w$]*)\s+from/g
  const names = []
  let match
  while ((match = namedImport.exec(content))) {
    if (match[1]) match[1].split(',').forEach(n => names.push(n.trim()))
  }
  while ((match = defaultImport.exec(content))) {
    if (match[1]) names.push(match[1])
  }
  while ((match = namespaceImport.exec(content))) {
    if (match[1]) names.push(match[1])
  }
  return names
}
const mutatesImportedState = (code, importNames) => {
  const mutationPatterns = importNames.map(name => {
    const nameEscaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(
      `${nameEscaped}(?:\\[[^\\]]+\\]|\\.[a-zA-Z_$][\\w$]*)\\s*=|delete\\s+${nameEscaped}`,
    )
  })
  return mutationPatterns.some(re => re.test(code))
}
export const testImportsMutableModuleState = async (tests, testFilePath) => {
  let fsModule
  try {
    fsModule = await import('@magic/fs')
  } catch {
    return false
  }
  const fs = fsModule
  let content
  try {
    content = fs.readFile ? await fs.readFile(testFilePath, 'utf-8') : undefined
  } catch {
    if (!testFilePath.endsWith('.js') && !testFilePath.endsWith('.mjs')) {
      try {
        content = fs.readFile ? await fs.readFile(testFilePath + '.js', 'utf-8') : undefined
      } catch {
        return false
      }
    } else {
      return false
    }
  }
  if (!content) return false
  const importNames = getImportNames(content)
  if (!importNames.length) return false
  const checkHook = hook => {
    if (is.function(hook)) {
      return mutatesImportedState(hook.toString(), importNames)
    }
    return false
  }
  const checkTestsInObject = testObj => {
    if (is.array(testObj)) {
      return testObj.some(t => checkTest(t))
    }
    if (is.objectNative(testObj)) {
      return Object.values(testObj).some(t => {
        if (is.objectNative(t) && t.tests) return checkTestsInObject(t.tests)
        if (is.objectNative(t)) return checkTest(t)
        return false
      })
    }
    return false
  }
  const checkTest = test => {
    if (checkHook(test?.before)) return true
    if (checkHook(test?.after)) return true
    if (test?.tests) return checkTestsInObject(test.tests)
    return false
  }
  const testsObj = tests
  if (checkHook(testsObj.beforeAll)) return true
  if (checkHook(testsObj.afterAll)) return true
  if (is.array(tests)) {
    return tests.some(t => checkTest(t))
  }
  if (is.objectNative(tests) && testsObj.tests) {
    return checkTestsInObject(testsObj.tests)
  }
  return false
}
const getPortPatterns = code => {
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
const getFilePaths = code => {
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
export const testUsesFixedPorts = tests => {
  const testsObj = tests
  const checkHook = hook => {
    if (is.function(hook)) {
      const ports = getPortPatterns(hook.toString())
      return ports.some(p => p !== '.listen(0')
    }
    return false
  }
  const checkTest = test => {
    if (checkHook(test?.before)) return true
    if (checkHook(test?.after)) return true
    return false
  }
  if (checkHook(testsObj.beforeAll)) return true
  if (checkHook(testsObj.afterAll)) return true
  if (is.array(tests)) {
    return tests.some(t => checkTest(t))
  }
  if (is.objectNative(tests)) {
    if (testsObj.tests) {
      return Object.values(testsObj.tests).some(t => checkTest(t))
    }
    return checkTest(tests)
  }
  return false
}
export const testUsesSharedFiles = tests => {
  const allFiles = new Set()
  const testsObj = tests
  const checkHook = hook => {
    if (is.function(hook)) {
      const files = getFilePaths(hook.toString())
      for (const file of files) {
        if (allFiles.has(file)) {
          return true
        }
        allFiles.add(file)
      }
    }
    return false
  }
  const checkTest = test => {
    if (checkHook(test?.before)) return true
    if (checkHook(test?.fn)) return true
    if (checkHook(test?.after)) return true
    return false
  }
  if (checkHook(testsObj.beforeAll)) return true
  if (checkHook(testsObj.afterAll)) return true
  if (is.array(tests)) {
    return tests.some(t => checkTest(t))
  }
  if (is.objectNative(tests)) {
    if (testsObj.tests) {
      return Object.values(testsObj.tests).some(t => checkTest(t))
    }
    return checkTest(tests)
  }
  return false
}
