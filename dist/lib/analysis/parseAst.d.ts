import type { Program } from 'oxc-parser'
export type { Program }
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
export declare const parseAst: (code: string, filename?: string) => Program
