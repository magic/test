import type { DtsAnalysis, DtsSymbol } from './analyzeDts.js'
/**
 * Virtual file name (relative to the .d.ts directory) of the probe source.
 * It never exists on disk - it is supplied by a custom compiler host.
 */
export declare const PROBE_FILE_NAME = '__dts_probe__.ts'
/**
 * A formatted diagnostic, one per line.
 */
export interface FormattedError {
  /** e.g. `src/app.d.ts(5,10): error TS2304: Cannot find name 'X'.` */
  line: string
  code: number
}
export interface SymbolResult {
  symbol: DtsSymbol
  pass: boolean
  /**
   * Diagnostics attributed to this symbol. May be non-empty even when
   * `pass` is true: an inert ambient-module augmentation (a `declare module`
   * in a module file whose target is not installed) is treated as passing,
   * and its TS2307 is kept for transparency.
   */
  errors: FormattedError[]
}
export interface DtsCheckResult {
  /** absolute path of the checked file */
  file: string
  /** path relative to the project root, posix separators */
  relFile: string
  /** the .d.ts file itself is valid TypeScript */
  filePass: boolean
  fileErrors: FormattedError[]
  /** one entry per extracted symbol */
  symbols: SymbolResult[]
  analysis: DtsAnalysis
}
export interface BuiltProbe {
  text: string
  /** 0-based probe line index -> owning symbol key */
  lineOwners: Map<number, string>
}
/**
 * Build the in-memory probe source for a .d.ts file.
 * Every symbol gets its own line(s) so diagnostics can be attributed 1:1.
 */
export declare const buildProbe: (analysis: DtsAnalysis, file: string) => BuiltProbe
/**
 * Summarize errors into a single line for a test failure message:
 * first error in full, the rest counted.
 */
export declare const summarizeErrors: (errors: FormattedError[]) => string
export declare const checkDtsFile: (file: string, root: string) => Promise<DtsCheckResult>
/** Drop cached results (used by tests). */
export declare const clearDtsCheckCache: () => void
