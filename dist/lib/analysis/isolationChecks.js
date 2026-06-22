import { walkTests } from './testWalker.js'
import {
  getImportNames,
  mutatesImportedState,
  getPortPatterns,
  getFilePaths,
} from './codeParser.js'
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
  if (!content) {
    return false
  }
  const importNames = getImportNames(content)
  if (!importNames.length) {
    return false
  }
  return walkTests(tests, test => {
    if (test.before && mutatesImportedState(test.before.toString(), importNames)) {
      return true
    }
    if (test.after && mutatesImportedState(test.after.toString(), importNames)) {
      return true
    }
    return false
  })
}
export const testUsesFixedPorts = tests => {
  return walkTests(tests, test => {
    // Check suite-level hooks
    if (test.beforeAll) {
      const ports = getPortPatterns(test.beforeAll.toString())
      if (ports.some(p => p !== '.listen(0')) {
        return true
      }
    }
    if (test.afterAll) {
      const ports = getPortPatterns(test.afterAll.toString())
      if (ports.some(p => p !== '.listen(0')) {
        return true
      }
    }
    // Check test-level hooks
    if (test.before) {
      const ports = getPortPatterns(test.before.toString())
      if (ports.some(p => p !== '.listen(0')) {
        return true
      }
    }
    if (test.after) {
      const ports = getPortPatterns(test.after.toString())
      if (ports.some(p => p !== '.listen(0')) {
        return true
      }
    }
    return false
  })
}
export const testUsesSharedFiles = tests => {
  const seenFiles = new Set()
  return walkTests(tests, test => {
    // Check all hook types
    for (const hook of [test.beforeAll, test.afterAll, test.before, test.fn, test.after]) {
      if (hook) {
        const files = getFilePaths(hook.toString())
        for (const file of files) {
          if (seenFiles.has(file)) {
            return true // duplicate = shared
          }
          seenFiles.add(file)
        }
      }
    }
    return false
  })
}
