/**
 * Include/exclude filtering for coverage files.
 *
 * Replaces test-exclude: a small glob matcher supporting the pattern subset
 * that coverage tooling uses (`**`, `*`, `?`, `!` negation) plus a
 * recursive directory walker for the `--all` mode.
 */
/**
 * Compiles a glob pattern to a RegExp. Supports `**`, `*`, `?` and
 * character escapes of all other regex metacharacters.
 */
export declare const globToRegExp: (pattern: string) => RegExp
export interface FilterOptions {
  /** patterns are relative to this directory */
  cwd: string
  include?: string[]
  exclude?: string[]
  /** when set, only files with one of these extensions pass */
  extensions?: string[]
  /** exclude everything under any node_modules directory */
  excludeNodeModules?: boolean
}
export declare class FileFilter {
  private readonly cwd
  private readonly extensions
  private readonly include
  private readonly exclude
  private readonly excludeNegated
  private readonly cache
  constructor(opts: FilterOptions)
  /** true when the absolute path should be included in the coverage report */
  shouldInstrument(absPath: string): boolean
  /** true when a directory (and everything below it) can be skipped */
  private dirExcluded
  /** all files below cwd that pass shouldInstrument (used by --all) */
  globAll(): Promise<string[]>
}
