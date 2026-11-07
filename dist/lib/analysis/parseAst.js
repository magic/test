import { parseSync } from 'oxc-parser'
/**
 * Parse JS/TS source into a plain, ESTree-shaped AST using the oxc parser
 * (the same parser that powers oxlint).
 *
 * Nodes carry both `start`/`end` offsets and `range: [start, end]`, and use
 * ESTree node type strings (`Identifier`, `Literal`, `ObjectPattern`, ...).
 *
 * Throws a SyntaxError on syntax errors, mirroring the previous
 * @typescript-eslint/parser behavior — callers rely on try/catch fallbacks.
 */
export const parseAst = (code, filename = 'file.ts') => {
  const { program, errors } = parseSync(filename, code, {
    sourceType: 'module',
    range: true,
    preserveParens: false,
  })
  if (errors.length > 0) {
    throw new SyntaxError(errors[0]?.message ?? 'Syntax error')
  }
  return program
}
//# sourceMappingURL=parseAst.js.map
