import is from '@magic/types'

const GLOBAL_MODIFICATION_RE_ASSIGN =
  /\b(?:globalThis|window|global|self)\b(?:\[[^\]]+\]|\.[a-zA-Z_$][\w$]*)\s*(?:[=+\-*/%]|<<?|>>?|&&|\|\|?)|\bprocess\.env\b[^\n]*[=+\-]/
const GLOBAL_MODIFICATION_RE_DELETE =
  /\bdelete\s+(?:globalThis|window|global|self|process)\b(?:\[[^\]]+\]|\.[a-zA-Z_$][\w$]*)/
const GLOBAL_MODIFICATION_RE = new RegExp(
  `(${GLOBAL_MODIFICATION_RE_ASSIGN.source})|(${GLOBAL_MODIFICATION_RE_DELETE.source})`,
)

export const testModifiesGlobals = test => {
  if (is.function(test.before)) {
    const beforeStr = test.before.toString()
    if (GLOBAL_MODIFICATION_RE.test(beforeStr)) {
      return true
    }
  }

  if (is.function(test.after)) {
    const afterStr = test.after.toString()
    if (GLOBAL_MODIFICATION_RE.test(afterStr)) {
      return true
    }
  }

  return false
}

export const suiteModifiesGlobals = tests => {
  if (is.array(tests)) {
    return tests.some(test => testModifiesGlobals(test))
  }

  if (is.objectNative(tests)) {
    return Object.values(tests).some(test => {
      if (is.objectNative(test) && testModifiesGlobals(test)) {
        return true
      }
      if (is.objectNative(test) && test.tests) {
        return suiteModifiesGlobals(test.tests)
      }
      return false
    })
  }

  return false
}

export const suiteBeforeAllModifiesGlobals = tests => {
  if (is.objectNative(tests) && is.function(tests.beforeAll)) {
    const beforeAllStr = tests.beforeAll.toString()
    return GLOBAL_MODIFICATION_RE.test(beforeAllStr)
  }
  return false
}

export const suiteAfterAllModifiesGlobals = tests => {
  if (is.objectNative(tests) && is.function(tests.afterAll)) {
    const afterAllStr = tests.afterAll.toString()
    return GLOBAL_MODIFICATION_RE.test(afterAllStr)
  }
  return false
}

const getImportNames = content => {
  const namedImport = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g
  const defaultImport = /import\s+([a-zA-Z_$][\w$]*)\s+from\s+['"][^'"]+['"]/g
  const namespaceImport = /import\s*\*\s+as\s+([a-zA-Z_$][\w$]*)\s+from/g

  const names = []
  let match

  while ((match = namedImport.exec(content))) {
    match[1].split(',').forEach(n => names.push(n.trim()))
  }
  while ((match = defaultImport.exec(content))) {
    names.push(match[1])
  }
  while ((match = namespaceImport.exec(content))) {
    names.push(match[1])
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
  let fs
  try {
    fs = await import('@magic/fs')
  } catch {
    return false
  }

  let content
  try {
    content = await fs.readFile(testFilePath, 'utf-8')
  } catch {
    // Try with .js extension if path doesn't have extension
    if (!testFilePath.endsWith('.js') && !testFilePath.endsWith('.mjs')) {
      try {
        content = await fs.readFile(testFilePath + '.js', 'utf-8')
      } catch {
        return false
      }
    } else {
      return false
    }
  }

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
      return testObj.some(checkTest)
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

  if (checkHook(tests.beforeAll)) return true
  if (checkHook(tests.afterAll)) return true

  if (is.array(tests)) {
    return tests.some(checkTest)
  }

  if (is.objectNative(tests) && tests.tests) {
    return checkTestsInObject(tests.tests)
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
      if (pathMatch) {
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

  if (checkHook(tests.beforeAll)) return true
  if (checkHook(tests.afterAll)) return true

  if (is.array(tests)) {
    return tests.some(checkTest)
  }

  if (is.objectNative(tests)) {
    if (tests.tests) {
      return Object.values(tests.tests).some(t => checkTest(t))
    }
    return checkTest(tests)
  }

  return false
}

export const testUsesSharedFiles = tests => {
  const allFiles = new Set()

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

  if (checkHook(tests.beforeAll)) return true
  if (checkHook(tests.afterAll)) return true

  if (is.array(tests)) {
    return tests.some(checkTest)
  }

  if (is.objectNative(tests)) {
    if (tests.tests) {
      return Object.values(tests.tests).some(t => checkTest(t))
    }
    return checkTest(tests)
  }

  return false
}
