import is from '@magic/types'
import { walkTests } from './analysis/testWalker.js'
// Match globals that a test might write to / read from. Word boundaries
// keep identifiers like `globalStartTime` or `windowWidth` from tripping
// the detector, and the literal-stripping below keeps string/template
// mentions ("the globalThis object") from doing the same.
const GLOBAL_MODIFICATION_RE =
  /\b(?:globalThis|window|global|self|localStorage|sessionStorage)\b|\bprocess\./
/**
 * Remove string literals, template literals, and comments so their contents
 * cannot produce false positives. Best effort — this is a heuristic detector,
 * not a parser: edge cases fall back to the original text.
 */
const stripLiterals = src => {
  try {
    return src
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, ' ')
      .replace(/`(?:\\`|[^`])*`/g, '``')
      .replace(/'(?:\\.|[^'\\\n])*'/g, "''")
      .replace(/"(?:\\.|[^"\\\n])*"/g, '""')
  } catch {
    return src
  }
}
export const functionModifiesGlobals = fn => {
  if (!is.fn(fn)) {
    return false
  }
  return GLOBAL_MODIFICATION_RE.test(stripLiterals(fn.toString()))
}
export const testModifiesGlobals = test => {
  return [test.before, test.after, test.fn, test.expect].some(functionModifiesGlobals)
}
export const suiteModifiesGlobals = tests => {
  return walkTests(tests, test => {
    if (
      functionModifiesGlobals(test.before) ||
      functionModifiesGlobals(test.after) ||
      functionModifiesGlobals(test.fn)
    ) {
      return true
    }
    // Also check suite-level hooks
    if (functionModifiesGlobals(test.beforeAll) || functionModifiesGlobals(test.afterAll)) {
      return true
    }
    return false
  })
}
//# sourceMappingURL=globalCheck.js.map
