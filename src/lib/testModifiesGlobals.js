import is from '@magic/types'

const GLOBAL_MODIFICATION_RE_ASSIGN =
  /\b(?:globalThis|window|global|self)\b(?:\[[^\]]+\]|\.[a-zA-Z_$][\w$]*)\s*(?:[=+\-*/%]|<<?|>>?|&&|\|\|?)|\bprocess\.env\b[^\n]*[=+\-]/

const GLOBAL_MODIFICATION_RE_DELETE =
  /\bdelete\s+(?:globalThis|window|global|self|process)\b(?:\[[^\]]+\]|\.[a-zA-Z_$][\w$]*)/

const GLOBAL_MODIFICATION_RE = new RegExp(
  `(${GLOBAL_MODIFICATION_RE_ASSIGN.source})|(${GLOBAL_MODIFICATION_RE_DELETE.source})`,
)

/**
 * Check if a single test modifies global state
 * @param {{ before?: Function, after?: Function }} test
 * @returns {boolean}
 */
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

/**
 * Check if any test in a suite modifies global state
 * @param {unknown} tests
 * @returns {boolean}
 */
export const suiteModifiesGlobals = tests => {
  if (is.array(tests)) {
    return tests.some(/** @param {unknown} test */ test => testModifiesGlobals(/** @type {{ before?: Function, after?: Function }} */ (test)))
  }

  if (is.objectNative(tests)) {
    return Object.values(/** @type {Record<string, unknown>} */ (tests)).some(/** @param {unknown} test */ test => {
      if (is.objectNative(test) && testModifiesGlobals(/** @type {{ before?: Function, after?: Function }} */ (test))) {
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

/**
 * Check if beforeAll modifies global state
 * @param {unknown} tests
 * @returns {boolean}
 */
export const suiteBeforeAllModifiesGlobals = tests => {
  const t = /** @type {{ beforeAll?: Function } | null} */ (tests)
  if (is.objectNative(t) && is.function(t.beforeAll)) {
    const beforeAllStr = t.beforeAll.toString()
    return GLOBAL_MODIFICATION_RE.test(beforeAllStr)
  }
  return false
}

/**
 * Check if afterAll modifies global state
 * @param {unknown} tests
 * @returns {boolean}
 */
export const suiteAfterAllModifiesGlobals = tests => {
  const t = /** @type {{ afterAll?: Function } | null} */ (tests)
  if (is.objectNative(t) && is.function(t.afterAll)) {
    const afterAllStr = t.afterAll.toString()
    return GLOBAL_MODIFICATION_RE.test(afterAllStr)
  }
  return false
}

/**
 * Extract imported names from code content
 * @param {string} content
 * @returns {string[]}
 */
const getImportNames = content => {
  const namedImport = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g
  const defaultImport = /import\s+([a-zA-Z_$][\w$]*)\s+from\s+['"][^'"]+['"]/g
  const namespaceImport = /import\s*\*\s+as\s+([a-zA-Z_$][\w$]*)\s+from/g

  /** @type {string[]} */
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

/**
 * Check if code mutates any of the imported names
 * @param {string} code
 * @param {string[]} importNames
 * @returns {boolean}
 */
const mutatesImportedState = (code, importNames) => {
  const mutationPatterns = importNames.map(name => {
    const nameEscaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(
      `${nameEscaped}(?:\\[[^\\]]+\\]|\\.[a-zA-Z_$][\\w$]*)\\s*=|delete\\s+${nameEscaped}`,
    )
  })

  return mutationPatterns.some(re => re.test(code))
}

/**
 * Check if test imports mutable module state
 * @param {unknown} tests
 * @param {string} testFilePath
 * @returns {Promise<boolean>}
 */
export const testImportsMutableModuleState = async (tests, testFilePath) => {
  /** @type {unknown} */
  let fsModule
  try {
    fsModule = await import('@magic/fs')
  } catch {
    return false
  }

  const fs = /** @type {{ readFile?: (path: string, enc: string) => Promise<string> }} */ (fsModule)

  /** @type {string | undefined} */
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

  /**
   * @param {unknown} hook
   * @returns {boolean}
   */
  const checkHook = hook => {
    if (is.function(hook)) {
      return mutatesImportedState(hook.toString(), importNames)
    }
    return false
  }

  /**
   * @param {unknown} testObj
   * @returns {boolean}
   */
  const checkTestsInObject = testObj => {
    if (is.array(testObj)) {
      return testObj.some(/** @param {unknown} t */ t => checkTest(/** @type {{ before?: Function, after?: Function, tests?: unknown }} */ (t)))
    }
    if (is.objectNative(testObj)) {
      return Object.values(/** @type {Record<string, unknown>} */ (testObj)).some(/** @param {unknown} t */ t => {
        if (is.objectNative(t) && t.tests) return checkTestsInObject(t.tests)
        if (is.objectNative(t)) return checkTest(/** @type {{ before?: Function, after?: Function, tests?: unknown }} */ (t))
        return false
      })
    }
    return false
  }

  /**
   * @param {{ before?: Function, after?: Function, tests?: unknown }} test
   * @returns {boolean}
   */
  const checkTest = test => {
    if (checkHook(test?.before)) return true
    if (checkHook(test?.after)) return true
    if (test?.tests) return checkTestsInObject(test.tests)
    return false
  }

  const testsObj = /** @type {{ beforeAll?: Function, afterAll?: Function, tests?: unknown }} */ (tests)

  if (checkHook(testsObj.beforeAll)) return true
  if (checkHook(testsObj.afterAll)) return true

  if (is.array(tests)) {
    return tests.some(/** @param {unknown} t */ t => checkTest(/** @type {{ before?: Function, after?: Function, tests?: unknown }} */ (t)))
  }

  if (is.objectNative(tests) && testsObj.tests) {
    return checkTestsInObject(testsObj.tests)
  }

  return false
}

/**
 * Extract port patterns from code
 * @param {string} code
 * @returns {string[]}
 */
const getPortPatterns = code => {
  /** @type {string[]} */
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

/**
 * Extract file paths from code
 * @param {string} code
 * @returns {string[]}
 */
const getFilePaths = code => {
  /** @type {string[]} */
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

/**
 * Check if tests use fixed ports instead of port 0
 * @param {unknown} tests
 * @returns {boolean}
 */
export const testUsesFixedPorts = tests => {
  const testsObj = /** @type {{ beforeAll?: Function, afterAll?: Function, tests?: unknown }} */ (tests)

  /**
   * @param {unknown} hook
   * @returns {boolean}
   */
  const checkHook = hook => {
    if (is.function(hook)) {
      const ports = getPortPatterns(hook.toString())
      return ports.some(p => p !== '.listen(0')
    }
    return false
  }

  /**
   * @param {{ before?: Function, after?: Function }} test
   * @returns {boolean}
   */
  const checkTest = test => {
    if (checkHook(test?.before)) return true
    if (checkHook(test?.after)) return true
    return false
  }

  if (checkHook(testsObj.beforeAll)) return true
  if (checkHook(testsObj.afterAll)) return true

  if (is.array(tests)) {
    return tests.some(/** @param {unknown} t */ t => checkTest(/** @type {{ before?: Function, after?: Function }} */ (t)))
  }

  if (is.objectNative(tests)) {
    if (testsObj.tests) {
      return Object.values(/** @type {Record<string, unknown>} */ (testsObj.tests)).some(/** @param {unknown} t */ t => checkTest(/** @type {{ before?: Function, after?: Function }} */ (t)))
    }
    return checkTest(/** @type {{ before?: Function, after?: Function }} */ (tests))
  }

  return false
}

/**
 * Check if tests use shared file resources (potential race conditions)
 * @param {unknown} tests
 * @returns {boolean}
 */
export const testUsesSharedFiles = tests => {
  /** @type {Set<string>} */
  const allFiles = new Set()

  const testsObj = /** @type {{ beforeAll?: Function, afterAll?: Function, tests?: unknown }} */ (tests)

  /**
   * @param {unknown} hook
   * @returns {boolean}
   */
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

  /**
   * @param {{ before?: Function, fn?: Function, after?: Function }} test
   * @returns {boolean}
   */
  const checkTest = test => {
    if (checkHook(test?.before)) return true
    if (checkHook(test?.fn)) return true
    if (checkHook(test?.after)) return true
    return false
  }

  if (checkHook(testsObj.beforeAll)) return true
  if (checkHook(testsObj.afterAll)) return true

  if (is.array(tests)) {
    return tests.some(/** @param {unknown} t */ t => checkTest(/** @type {{ before?: Function, fn?: Function, after?: Function }} */ (t)))
  }

  if (is.objectNative(tests)) {
    if (testsObj.tests) {
      return Object.values(/** @type {Record<string, unknown>} */ (testsObj.tests)).some(/** @param {unknown} t */ t => checkTest(/** @type {{ before?: Function, fn?: Function, after?: Function }} */ (t)))
    }
    return checkTest(/** @type {{ before?: Function, fn?: Function, after?: Function }} */ (tests))
  }

  return false
}