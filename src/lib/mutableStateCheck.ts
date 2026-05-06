import is from '@magic/types'
import type { TestCollection, TestObject, WrappedTest } from '../types.js'

interface FsModule {
  readFile?: (path: string, encoding?: string) => Promise<string | undefined>
}

interface TestWithHooks {
  before?: { toString(): string }
  after?: { toString(): string }
  fn?: { toString(): string }
  tests?: unknown
}

interface TestObjWithHooks {
  beforeAll?: { toString(): string }
  afterAll?: { toString(): string }
  tests?: unknown
  fn?: { toString(): string }
}

const getImportNames = (content: string): string[] => {
  const namedImport = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g
  const defaultImport = /import\s+([a-zA-Z_$][\w$]*)\s+from\s*['"][^'"]+['"]/g
  const namespaceImport = /import\s*\*\s+as\s+([a-zA-Z_$][\w$]*)\s+from/g

  const names: string[] = []
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

const mutatesImportedState = (code: string, importNames: string[]): boolean => {
  const mutationPatterns = importNames.map(name => {
    const nameEscaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(
      `${nameEscaped}(?:\\[[^\\]]+\\]|\\.[a-zA-Z_$][\\w$]*)\\s*=|delete\\s+${nameEscaped}`,
    )
  })

  return mutationPatterns.some((re: RegExp) => re.test(code))
}

export const testImportsMutableModuleState = async (
  tests: TestCollection | TestObject | WrappedTest[],
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

  const checkHook = (hook: { toString(): string }): boolean => {
    return mutatesImportedState(hook.toString(), importNames)
  }

  const checkTestsInObject = (testObj: unknown): boolean => {
    if (is.array(testObj)) {
      return (testObj as TestWithHooks[]).some(t => checkTest(t))
    }
    if (is.objectNative(testObj)) {
      return Object.values(testObj as Record<string, TestWithHooks>).some(t => {
        if (t.tests) {
          return checkTestsInObject(t.tests)
        }
        return checkTest(t)
      })
    }
    return false
  }

  const checkTest = (test: TestWithHooks): boolean => {
    if (test.before && is.function(test.before)) {
      return true
    }
    if (test.after && is.function(test.after)) {
      return true
    }
    if (test.tests) return checkTestsInObject(test.tests)
    return false
  }

  const testsObj = tests as TestObjWithHooks

  if (testsObj.beforeAll && checkHook(testsObj.beforeAll)) {
    return true
  }
  if (testsObj.afterAll && checkHook(testsObj.afterAll)) {
    return true
  }

  if (is.array(tests)) {
    return (tests as WrappedTest[]).some(t => is.function(t.before) || is.function(t.after))
  }

  if (is.objectNative(tests) && testsObj.tests) {
    return checkTestsInObject(testsObj.tests)
  }

  return false
}

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

const getFilePaths = (code: string): string[] => {
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

export const testUsesFixedPorts = (tests: TestCollection | TestObject | WrappedTest[]): boolean => {
  const testsObj = tests as TestObjWithHooks

  const checkHook = (hook: { toString(): string }): boolean => {
    const ports = getPortPatterns(hook.toString())
    return ports.some(p => p !== '.listen(0')
  }

  if (testsObj.beforeAll && checkHook(testsObj.beforeAll)) {
    return true
  }
  if (testsObj.afterAll && checkHook(testsObj.afterAll)) {
    return true
  }

  if (is.array(tests)) {
    return (tests as WrappedTest[]).some(t => is.function(t.before) || is.function(t.after))
  }

  if (is.objectNative(tests)) {
    if (testsObj.tests) {
      return checkTestsInObject(testsObj.tests)
    }
    return is.function(tests.before) || is.function(tests.after)
  }

  return false
}

const checkTestsInObject = (testObj: unknown): boolean => {
  if (is.array(testObj)) {
    return (testObj as TestWithHooks[]).some(t => {
      if (t.before && is.function(t.before)) return true
      if (t.after && is.function(t.after)) return true
      return false
    })
  }
  if (is.objectNative(testObj)) {
    return Object.values(testObj as Record<string, TestWithHooks>).some(t => {
      if (t.tests) return checkTestsInObject(t.tests)
      if (t.before && is.function(t.before)) return true
      if (t.after && is.function(t.after)) return true
      return false
    })
  }
  return false
}

export const testUsesSharedFiles = (
  tests: TestCollection | TestObject | WrappedTest[],
): boolean => {
  const allFiles = new Set()

  const testsObj = tests as TestObjWithHooks

  const checkHook = (hook: { toString(): string }): boolean => {
    const files = getFilePaths(hook.toString())
    for (const file of files) {
      if (allFiles.has(file)) {
        return true
      }
      allFiles.add(file)
    }
    return false
  }

  if (testsObj.beforeAll && checkHook(testsObj.beforeAll)) {
    return true
  }
  if (testsObj.afterAll && checkHook(testsObj.afterAll)) {
    return true
  }

  if (is.array(tests)) {
    return (tests as WrappedTest[]).some(
      t => is.function(t.before) || is.function(t.fn) || is.function(t.after),
    )
  }

  if (is.objectNative(tests)) {
    if (testsObj.tests) {
      return checkTestsInObjectShared(testsObj.tests)
    }
    return is.function(tests.before) || is.function(tests.fn) || is.function(tests.after)
  }

  return false
}

const checkTestsInObjectShared = (testObj: unknown): boolean => {
  if (is.array(testObj)) {
    return (testObj as TestWithHooks[]).some(t => {
      if (t.before && is.function(t.before)) return true
      if (t.fn && is.function(t.fn)) return true
      if (t.after && is.function(t.after)) return true
      return false
    })
  }
  if (is.objectNative(testObj)) {
    return Object.values(testObj as Record<string, TestWithHooks>).some(t => {
      if (t.tests) return checkTestsInObjectShared(t.tests)
      if (t.before && is.function(t.before)) return true
      if (t.fn && is.function(t.fn)) return true
      if (t.after && is.function(t.after)) return true
      return false
    })
  }
  return false
}
