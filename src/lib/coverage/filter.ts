/**
 * Include/exclude filtering for coverage files.
 *
 * Replaces test-exclude: a small glob matcher supporting the pattern subset
 * that coverage tooling uses (`**`, `*`, `?`, `!` negation) plus a
 * recursive directory walker for the `--all` mode.
 */

import path from 'node:path'
import fs from 'node:fs'

const SEP = '/'

/**
 * Normalizes a user pattern the same way test-exclude does:
 *  - a pattern without a trailing "double-star slash" suffix also matches
 *    everything inside it (e.g. `test` also matches everything below `test`)
 *  - a leading "double-star slash" prefix also matches at the top level
 *    (e.g. the node_modules exclusion also matches node_modules at the root)
 */
const prepGlobPattern = (pattern: string): string[] => {
  const result: string[] = []
  const p = pattern.replace(/\\/g, SEP)
  if (!/\/\*\*$/.test(p)) {
    result.push(p.replace(/\/$/, '') + '/**')
  }
  if (/^\*\*\//.test(p)) {
    result.push(p.replace(/^\*\*\//, ''))
  }
  result.push(p)
  return result
}

/**
 * Compiles a glob pattern to a RegExp. Supports `**`, `*`, `?` and
 * character escapes of all other regex metacharacters.
 */
export const globToRegExp = (pattern: string): RegExp => {
  let out = ''
  let i = 0
  const p = pattern.replace(/\\/g, SEP)
  while (i < p.length) {
    const c = p.charAt(i)
    if (c === '*') {
      if (p.charAt(i + 1) === '*') {
        // `**/` matches zero or more path segments, bare `**` matches anything
        if (p.charAt(i + 2) === SEP) {
          out += '(?:.*/)?'
          i += 3
        } else {
          out += '.*'
          i += 2
        }
      } else {
        out += '[^/]*'
        i++
      }
    } else if (c === '?') {
      out += '[^/]'
      i++
    } else if ('\\^$.|+()[]{}'.includes(c)) {
      out += '\\' + c
      i++
    } else {
      out += c
      i++
    }
  }
  return new RegExp('^' + out + '$')
}

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

export class FileFilter {
  private readonly cwd: string
  private readonly extensions: string[]
  private readonly include: RegExp[]
  private readonly exclude: RegExp[]
  private readonly excludeNegated: RegExp[]
  private readonly cache = new Map<string, boolean>()

  constructor(opts: FilterOptions) {
    this.cwd = opts.cwd
    this.extensions = (opts.extensions || []).map(e => e.replace(/^\./, ''))

    let include = opts.include || []
    let exclude = [...(opts.exclude || [])]
    if (include.length === 0) include = []
    if (opts.excludeNodeModules !== false && !exclude.some(p => p.includes('node_modules'))) {
      exclude.push('**/node_modules/**')
    }

    // handle negation: `!pattern` entries in include move to exclude,
    // negated excludes re-include
    const includeNegated = include.filter(p => p.startsWith('!')).map(p => p.slice(1))
    include = include.filter(p => !p.startsWith('!'))
    const excludeNegated = exclude.filter(p => p.startsWith('!')).map(p => p.slice(1))
    exclude = exclude.filter(p => !p.startsWith('!'))
    exclude.push(...includeNegated)

    const compile = (patterns: string[]) => patterns.flatMap(prepGlobPattern).map(globToRegExp)

    this.include = compile(include)
    this.exclude = compile(exclude)
    this.excludeNegated = compile(excludeNegated)
  }

  /** true when the absolute path should be included in the coverage report */
  shouldInstrument(absPath: string): boolean {
    const cached = this.cache.get(absPath)
    if (cached !== undefined) return cached

    let result = false
    const ext = path.extname(absPath).replace(/^\./, '')
    if (this.extensions.length === 0 || this.extensions.includes(ext)) {
      let rel = path.relative(this.cwd, absPath)
      if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
        // outside the project root: never included
        result = false
      } else {
        rel = rel.split(path.sep).join(SEP)
        const matches = (re: RegExp) => re.test(rel)
        const included = this.include.length === 0 || this.include.some(matches)
        const excluded = this.exclude.some(matches)
        const reIncluded = this.excludeNegated.some(matches)
        result = included && (!excluded || reIncluded)
      }
    }
    this.cache.set(absPath, result)
    return result
  }

  /** true when a directory (and everything below it) can be skipped */
  private dirExcluded(relDir: string): boolean {
    if (relDir === '' || relDir === '.') return false
    if (relDir.split(SEP).includes('node_modules')) return true
    // a directory is excludable when it matches a pattern that matches
    // everything below it (i.e. one that was extended with `/**`)
    for (const re of this.exclude) {
      if (re.test(relDir + SEP + '.')) return true
    }
    return false
  }

  /** all files below cwd that pass shouldInstrument (used by --all) */
  async globAll(): Promise<string[]> {
    const found: string[] = []
    const walk = async (dir: string): Promise<void> => {
      let entries: fs.Dirent[]
      try {
        entries = await fs.promises.readdir(dir, { withFileTypes: true })
      } catch {
        return
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          const rel = path.relative(this.cwd, full).split(path.sep).join(SEP)
          if (!this.dirExcluded(rel)) {
            await walk(full)
          }
        } else if (entry.isFile()) {
          if (this.shouldInstrument(full)) {
            found.push(full)
          }
        }
      }
    }
    await walk(this.cwd)
    return found
  }
}
