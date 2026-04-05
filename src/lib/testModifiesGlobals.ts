import is from '@magic/types'

/**
 * Minimal interface for the @magic/fs module.
 */
interface FsModule {
  readFile?: (path: string, encoding?: string) => Promise<string | undefined>
}

const GLOBAL_MODIFICATION_RE_ASSIGN =
  /\b(?:globalThis|window|global|self)\b(?:\[[^\]]+\]|\.[a-zA-Z_$][\w$]*)\s*(?:[=+\-*/%]|<<?|>>?|&&|\|\|?)|\bprocess\.env\b[^\n]*[=+\-]/

const GLOBAL_MODIFICATION_RE_DELETE =
  /\bdelete\s+(?:globalThis|window|global|self|process)\b(?:\[[^\]]+\]|\.[a-zA-Z_$][\w$]*)/

const GLOBAL_MODIFICATION_RE = new RegExp(
  `(${GLOBAL_MODIFICATION_RE_ASSIGN.source})|(${GLOBAL_MODIFICATION_RE_DELETE.source})`,
)

/**
 * Check if a single test modifies global state
 */
export const testModifiesGlobals = (test: {
  before?: (...args: unknown[]) => unknown
  after?: (...args: unknown[]) => unknown
}): boolean => {
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
 */
export const suiteModifiesGlobals = (tests: unknown): boolean => {
  if (is.array(tests)) {
    return tests.some(test =>
      testModifiesGlobals(
        test as {
          before?: (...args: unknown[]) => unknown
          after?: (...args: unknown[]) => unknown
        },
      ),
    )
  }

  if (is.objectNative(tests)) {
    return Object.values(tests as Record<string, unknown>).some(test => {
      if (
        is.objectNative(test) &&
        testModifiesGlobals(
          test as {
            before?: (...args: unknown[]) => unknown
            after?: (...args: unknown[]) => unknown
          },
        )
      ) {
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
 */
export const suiteBeforeAllModifiesGlobals = (tests: unknown): boolean => {
  const t = tests
  if (is.objectNative(t) && is.function(t.beforeAll)) {
    const beforeAllStr = t.beforeAll.toString()
    return GLOBAL_MODIFICATION_RE.test(beforeAllStr)
  }
  return false
}

/**
 * Check if afterAll modifies global state
 */
export const suiteAfterAllModifiesGlobals = (tests: unknown): boolean => {
  const t = tests
  if (is.objectNative(t) && is.function(t.afterAll)) {
    const afterAllStr = t.afterAll.toString()
    return GLOBAL_MODIFICATION_RE.test(afterAllStr)
  }
  return false
}

/**
 * Extract imported names from code content
 */
const getImportNames = (content: string): string[] => {
  const namedImport = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g
  const defaultImport = /import\s+([a-zA-Z_$][\w$]*)\s+from\s+['"][^'"]+['"]/g
  const namespaceImport = /import\s*\*\s+as\s+([a-zA-Z_$][\w$]*)\s+from/g

  const names: string[] = []
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
 */
const mutatesImportedState = (code: string, importNames: string[]): boolean => {
  const mutationPatterns = importNames.map(name => {
    const nameEscaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(
      `${nameEscaped}(?:\\[[^\\]]+\\]|\\.[a-zA-Z_$][\\w$]*)\\s*=|delete\\s+${nameEscaped}`,
    )
  })

  return mutationPatterns.some((re: RegExp) => re.test(code))
}

/**
 * Check if test imports mutable module state
 */
export const testImportsMutableModuleState = async (
  tests: unknown,
  testFilePath: string,
): Promise<boolean> => {
  let fsModule
  try {
    fsModule = await import('@magic/fs')
  } catch {
    return false
  }

  const fs = fsModule as FsModule

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

  const checkHook = (hook: unknown): boolean => {
    if (is.function(hook)) {
      return mutatesImportedState(hook.toString(), importNames)
    }
    return false
  }

  const checkTestsInObject = (testObj: unknown): boolean => {
    if (is.array(testObj)) {
      return testObj.some(t =>
        checkTest(
          t as {
            before?: (...args: unknown[]) => unknown
            after?: (...args: unknown[]) => unknown
            tests?: unknown
          },
        ),
      )
    }
    if (is.objectNative(testObj)) {
      return Object.values(testObj as Record<string, unknown>).some(t => {
        if (is.objectNative(t) && t.tests) return checkTestsInObject(t.tests)
        if (is.objectNative(t))
          return checkTest(
            t as {
              before?: (...args: unknown[]) => unknown
              after?: (...args: unknown[]) => unknown
              tests?: unknown
            },
          )
        return false
      })
    }
    return false
  }

  const checkTest = (test: {
    before?: (...args: unknown[]) => unknown
    after?: (...args: unknown[]) => unknown
    tests?: unknown
  }): boolean => {
    if (checkHook(test?.before)) return true
    if (checkHook(test?.after)) return true
    if (test?.tests) return checkTestsInObject(test.tests)
    return false
  }

  const testsObj = tests as {
    beforeAll?: (...args: unknown[]) => unknown
    afterAll?: (...args: unknown[]) => unknown
    tests?: unknown
  }

  if (checkHook(testsObj.beforeAll)) return true
  if (checkHook(testsObj.afterAll)) return true

  if (is.array(tests)) {
    return tests.some(t =>
      checkTest(
        t as {
          before?: (...args: unknown[]) => unknown
          after?: (...args: unknown[]) => unknown
          tests?: unknown
        },
      ),
    )
  }

  if (is.objectNative(tests) && testsObj.tests) {
    return checkTestsInObject(testsObj.tests)
  }

  return false
}

/**
 * Extract port patterns from code
 */
const getPortPatterns = (code: string): string[] => {
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

/**
 * Extract file paths from code
 */
const getFilePaths = (code: string): string[] => {
  const files: string[] = []

  const fsMethodMatch = code.match(/fs\.\w+\(\s*['"]([^'"]+)['"]/g)
  if (fsMethodMatch) {
    fsMethodMatch.forEach((match: string) => {
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
 */
export const testUsesFixedPorts = (tests: unknown): boolean => {
  const testsObj = tests as {
    beforeAll?: (...args: unknown[]) => unknown
    afterAll?: (...args: unknown[]) => unknown
    tests?: unknown
  }

  const checkHook = (hook: unknown): boolean => {
    if (is.function(hook)) {
      const ports = getPortPatterns(hook.toString())
      return ports.some(p => p !== '.listen(0')
    }
    return false
  }

  const checkTest = (test: {
    before?: (...args: unknown[]) => unknown
    after?: (...args: unknown[]) => unknown
  }): boolean => {
    if (checkHook(test?.before)) return true
    if (checkHook(test?.after)) return true
    return false
  }

  if (checkHook(testsObj.beforeAll)) return true
  if (checkHook(testsObj.afterAll)) return true

  if (is.array(tests)) {
    return tests.some(t =>
      checkTest(
        t as { before?: (...args: unknown[]) => unknown; after?: (...args: unknown[]) => unknown },
      ),
    )
  }

  if (is.objectNative(tests)) {
    if (testsObj.tests) {
      return Object.values(testsObj.tests as Record<string, unknown>).some(t =>
        checkTest(
          t as {
            before?: (...args: unknown[]) => unknown
            after?: (...args: unknown[]) => unknown
          },
        ),
      )
    }
    return checkTest(
      tests as {
        before?: (...args: unknown[]) => unknown
        after?: (...args: unknown[]) => unknown
      },
    )
  }

  return false
}

/**
 * Check if tests use shared file resources (potential race conditions)
 */
export const testUsesSharedFiles = (tests: unknown): boolean => {
  const allFiles = new Set()

  const testsObj = tests as {
    beforeAll?: (...args: unknown[]) => unknown
    afterAll?: (...args: unknown[]) => unknown
    tests?: unknown
  }

  const checkHook = (hook: unknown): boolean => {
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

  const checkTest = (test: {
    before?: (...args: unknown[]) => unknown
    fn?: (...args: unknown[]) => unknown
    after?: (...args: unknown[]) => unknown
  }): boolean => {
    if (checkHook(test?.before)) return true
    if (checkHook(test?.fn)) return true
    if (checkHook(test?.after)) return true
    return false
  }

  if (checkHook(testsObj.beforeAll)) return true
  if (checkHook(testsObj.afterAll)) return true

  if (is.array(tests)) {
    return tests.some(t =>
      checkTest(
        t as {
          before?: (...args: unknown[]) => unknown
          fn?: (...args: unknown[]) => unknown
          after?: (...args: unknown[]) => unknown
        },
      ),
    )
  }

  if (is.objectNative(tests)) {
    if (testsObj.tests) {
      return Object.values(testsObj.tests as Record<string, unknown>).some(t =>
        checkTest(
          t as {
            before?: (...args: unknown[]) => unknown
            fn?: (...args: unknown[]) => unknown
            after?: (...args: unknown[]) => unknown
          },
        ),
      )
    }
    return checkTest(
      tests as {
        before?: (...args: unknown[]) => unknown
        fn?: (...args: unknown[]) => unknown
        after?: (...args: unknown[]) => unknown
      },
    )
  }

  return false
}
