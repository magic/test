import path from 'node:path'
import { statSync } from 'node:fs'

import fs from '@magic/fs'
import ts from 'typescript'

import { analyzeDts } from './analyzeDts.js'
import type { DtsAnalysis, DtsSymbol, ProbeLine } from './analyzeDts.js'

/**
 * Virtual file name (relative to the .d.ts directory) of the probe source.
 * It never exists on disk - it is supplied by a custom compiler host.
 */
export const PROBE_FILE_NAME = '__dts_probe__.ts'

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

const compilerOptions: ts.CompilerOptions = {
  noEmit: true,
  strict: true,
  // skipLibCheck would also skip OUR target .d.ts file - keep checking on
  skipLibCheck: false,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  // do not auto-include @types/* packages
  types: [],
}

/**
 * Diagnostic codes meaning "the module specifier itself cannot be resolved"
 * (as opposed to "the module exists but is missing this export", which is a
 * genuine error in the declaration).
 */
const MODULE_NOT_FOUND_CODES = new Set([2307, 2792])

/**
 * True when every error on a symbol is a module-resolution failure. Used to
 * detect an inert ambient-module augmentation (see `isInertAugmentation`).
 */
const isOnlyModuleNotFound = (errors: FormattedError[]): boolean =>
  errors.length > 0 && errors.every(e => MODULE_NOT_FOUND_CODES.has(e.code))

/**
 * A `declare module "x"` inside a *module* file is a module **augmentation**,
 * not a declaration: it only attaches to `x` when `x` actually resolves. When
 * the real dependency is absent the augmentation is a no-op fallback and the
 * probe's `import ... from "x"` fails with TS2307 even though the declaration
 * is perfectly valid. Detect that so we don't report a false failure.
 *
 * It must be an ambient-module symbol (imports from an external specifier),
 * and the declaring file must be a module. In an ambient *script* file a
 * `declare module "x"` actually creates the module, so a TS2307 there is a
 * real error and is NOT inert.
 */
const isInertAugmentation = (analysis: DtsAnalysis, symbol: DtsSymbol): boolean =>
  analysis.isModule && symbol.lines.some(pl => 'from' in pl && pl.from !== 'file')

const renderProbeLine = (line: ProbeLine, fileSpecifier: string): string => {
  switch (line.kind) {
    case 'importType':
      return `import type { ${line.name} } from '${line.from === 'file' ? fileSpecifier : line.from}'`
    case 'importValue':
      return `import { ${line.name} } from '${line.from === 'file' ? fileSpecifier : line.from}'`
    case 'sideEffectImport':
      return `import '${line.from}'`
    case 'typeRef':
      if (line.via === 'globalThis') {
        return `type ${line.alias} = typeof globalThis.${line.target}`
      }
      return `type ${line.alias} = ${line.value ? `typeof ${line.target}` : line.target}`
  }
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
export const buildProbe = (analysis: DtsAnalysis, file: string): BuiltProbe => {
  const lines: string[] = []
  const lineOwners = new Map<number, string>()

  // import specifier: sibling file, e.g. `./app` for `app.d.ts`
  const base = path.basename(file).replace(/\.d\.ts$/, '')
  const fileSpecifier = `./${base}`

  for (const symbol of analysis.symbols) {
    for (const pl of symbol.lines) {
      lines.push(renderProbeLine(pl, fileSpecifier))
      lineOwners.set(lines.length - 1, symbol.key)
    }
  }

  // keep the probe a module file
  lines.push('export {}')
  return { text: lines.join('\n') + '\n', lineOwners }
}

const formatDiagnostic = (d: ts.Diagnostic, root: string): FormattedError => {
  const message = ts.flattenDiagnosticMessageText(d.messageText, ' ')
  if (d.file && d.start !== undefined) {
    const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start)
    const rel = path.relative(root, d.file.fileName).split(path.sep).join('/')
    return {
      line: `${rel}(${line + 1},${character + 1}): error TS${d.code}: ${message}`,
      code: d.code,
    }
  }
  return { line: `error TS${d.code}: ${message}`, code: d.code }
}

/**
 * Summarize errors into a single line for a test failure message:
 * first error in full, the rest counted.
 */
export const summarizeErrors = (errors: FormattedError[]): string => {
  if (errors.length === 0) {
    return 'no errors'
  }
  const first = errors[0]!
  const rest = errors.length - 1
  return rest > 0 ? `${first.line} (+${rest} more error${rest > 1 ? 's' : ''})` : first.line
}

const checkImpl = async (file: string, root: string): Promise<DtsCheckResult> => {
  const source = await fs.readFile(file, 'utf-8')
  const analysis = analyzeDts(source, file)
  const probe = buildProbe(analysis, file)
  const probePath = path.join(path.dirname(file), PROBE_FILE_NAME)

  const host = ts.createCompilerHost(compilerOptions)
  const origGetSourceFile = host.getSourceFile.bind(host)
  const origFileExists = host.fileExists.bind(host)
  const origReadFile = host.readFile.bind(host)

  host.fileExists = (f: string): boolean => (f === probePath ? true : origFileExists(f))
  host.readFile = (f: string): string | undefined =>
    f === probePath ? probe.text : origReadFile(f)
  host.getSourceFile = (
    f: string,
    languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
    onError?: (message: string) => void,
    shouldCreateNewSourceFile?: boolean,
  ): ts.SourceFile | undefined =>
    f === probePath
      ? ts.createSourceFile(
          f,
          probe.text,
          typeof languageVersionOrOptions === 'number'
            ? languageVersionOrOptions
            : (languageVersionOrOptions.languageVersion ?? ts.ScriptTarget.ES2022),
          shouldCreateNewSourceFile ?? true,
        )
      : origGetSourceFile(f, languageVersionOrOptions, onError, shouldCreateNewSourceFile)

  const program = ts.createProgram([file, probePath], compilerOptions, host)
  const dtsSF = program.getSourceFile(file)
  const probeSF = program.getSourceFile(probePath)

  const fileErrors: FormattedError[] = []
  if (dtsSF) {
    for (const d of [
      ...program.getSyntacticDiagnostics(dtsSF),
      ...program.getSemanticDiagnostics(dtsSF),
    ]) {
      fileErrors.push(formatDiagnostic(d, root))
    }
  }

  const errorsBySymbol = new Map<string, FormattedError[]>()
  if (probeSF) {
    for (const d of program.getSemanticDiagnostics(probeSF)) {
      // diagnostics may point at the .d.ts itself (e.g. from the import) -
      // those are already reported by the file check; only probe-local
      // diagnostics are attributed to symbols
      if (d.file !== probeSF) {
        continue
      }
      const { line } = ts.getLineAndCharacterOfPosition(probeSF, d.start ?? 0)
      const owner = probe.lineOwners.get(line)
      if (!owner) {
        continue
      }
      errorsBySymbol.set(owner, [...(errorsBySymbol.get(owner) ?? []), formatDiagnostic(d, root)])
    }
  }

  const symbols: SymbolResult[] = analysis.symbols.map(symbol => {
    const errors = errorsBySymbol.get(symbol.key) ?? []
    // An inert ambient-module augmentation (module file + unresolvable target
    // whose only errors are TS2307) is a valid fallback declaration, not a
    // failure - the real dependency is simply not installed.
    const inert =
      errors.length > 0 && isOnlyModuleNotFound(errors) && isInertAugmentation(analysis, symbol)
    return { symbol, pass: errors.length === 0 || inert, errors }
  })

  return {
    file,
    relFile: path.relative(root, file).split(path.sep).join('/'),
    filePass: fileErrors.length === 0,
    fileErrors,
    symbols,
    analysis,
  }
}

/**
 * Per-file check cache. Keyed by absolute path; entries are re-validated
 * against file mtime so long-lived processes see edits.
 */
const cache = new Map<string, { mtimeMs: number; promise: Promise<DtsCheckResult> }>()

export const checkDtsFile = (file: string, root: string): Promise<DtsCheckResult> => {
  let mtimeMs = 0
  try {
    mtimeMs = statSync(file).mtimeMs
  } catch {
    // missing file - mtime stays 0, the check itself will report the error
  }

  const existing = cache.get(file)
  if (existing && existing.mtimeMs === mtimeMs) {
    return existing.promise
  }

  const promise = checkImpl(file, root)
  cache.set(file, { mtimeMs, promise })
  promise.catch(() => cache.delete(file))
  return promise
}

/** Drop cached results (used by tests). */
export const clearDtsCheckCache = (): void => {
  cache.clear()
}
