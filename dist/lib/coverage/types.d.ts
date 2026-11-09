/**
 * Types for the local V8 coverage pipeline.
 *
 * Replaces c8 + v8-to-istanbul + istanbul-lib-coverage with a minimal
 * implementation that reads the coverage JSON files Node.js writes to
 * NODE_V8_COVERAGE, remaps them through source maps and renders a text
 * report.
 */
/** A single V8 coverage range (a basic block in block coverage mode) */
export interface V8Range {
  startOffset: number
  endOffset: number
  count: number
}
/** Coverage of one function within one script */
export interface V8FunctionCoverage {
  functionName: string
  ranges: V8Range[]
  isBlockCoverage: boolean
}
/** Coverage of one script (one loaded module) */
export interface V8ScriptCoverage {
  scriptId: string | number
  url: string
  functions: V8FunctionCoverage[]
}
/** Source map cache entry written by Node.js for --enable-source-maps */
export interface SourceMapCacheEntry {
  lineLengths?: number[]
  data: RawSourceMap
  url: string | null
}
export type SourceMapCache = Record<string, SourceMapCacheEntry>
/** Raw source map (version 3) as embedded in V8 coverage data */
export interface RawSourceMap {
  version: number
  file?: string | null
  sourceRoot?: string
  sources: string[]
  names?: string[]
  mappings: string
  sourcesContent?: (string | null)[]
}
/** One V8 process coverage document (one coverage-*.json file) */
export interface V8ProcessCoverage {
  result: V8ScriptCoverage[]
  timestamp?: number
  'source-map-cache'?: SourceMapCache
}
/** A position in a source file (1-based line, 0-based column) */
export interface Position {
  line: number
  column: number
}
/** An inclusive location range */
export interface Location {
  start: Position
  end: Position
}
/** Istanbul-format file coverage for one source file */
export interface FileCoverage {
  path: string
  all?: boolean
  statementMap: Record<string, Location>
  s: Record<string, number>
  fnMap: Record<
    string,
    {
      name: string
      decl: Location
      loc: Location
      line: number
    }
  >
  f: Record<string, number>
  branchMap: Record<
    string,
    {
      type: 'branch'
      line: number
      loc: Location
      locations: Location[]
    }
  >
  b: Record<string, number[]>
}
/** Per-metric coverage summary */
export interface MetricSummary {
  total: number
  covered: number
  pct: number
}
export interface CoverageSummary {
  statements: MetricSummary
  branches: MetricSummary
  functions: MetricSummary
  lines: MetricSummary
}
/** Options for generating the coverage report */
export interface CoverageOptions {
  /** directory Node.js wrote the coverage-*.json files to (NODE_V8_COVERAGE) */
  tempDir: string
  /** project root the include/exclude patterns are relative to */
  cwd: string
  /** glob patterns of files to include (e.g. ['src']) */
  include: string[]
  /** glob patterns of files to exclude (e.g. ['test']) */
  exclude: string[]
  /** file extensions to consider (e.g. ['.js', '.mjs', '.ts']) */
  extensions: string[]
  /** add empty (0%) coverage for all matching files that were never loaded */
  all?: boolean
  /** apply exclude/include to the source-map-remapped path instead of the
   *  generated path */
  excludeAfterRemap?: boolean
  /** whether output supports ANSI colors */
  color?: boolean
  /** max table width, defaults to stdout columns */
  maxCols?: number
}
