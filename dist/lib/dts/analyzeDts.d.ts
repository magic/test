/**
 * One line of the generated probe file. The probe is type-checked in memory;
 * diagnostics on a line are attributed to the symbol that owns the line.
 *
 * Rendering:
 * - importType        -> `import type { name } from 'from'`
 * - importValue       -> `import { name } from 'from'`
 * - sideEffectImport  -> `import 'from'`
 * - typeRef plain,!value     -> `type alias = target`
 * - typeRef plain,value      -> `type alias = typeof target`
 * - typeRef globalThis       -> `type alias = typeof globalThis.target`
 */
export type ProbeLine =
  | {
      kind: 'importType'
      name: string
      from: 'file' | string
    }
  | {
      kind: 'importValue'
      name: string
      from: 'file' | string
    }
  | {
      kind: 'sideEffectImport'
      from: string
    }
  | {
      kind: 'typeRef'
      alias: string
      target: string
      value: boolean
      via: 'plain' | 'globalThis'
    }
export interface DtsSymbol {
  /** Unique key within the file, e.g. `interface:AppInstance` */
  key: string
  /** Human readable name for the test, e.g. `interface AppInstance` */
  displayName: string
  /** What is being verified */
  info: string
  /** Probe lines; all are attributed to this symbol */
  lines: ProbeLine[]
}
export interface DtsAnalysis {
  /** true when the file has top-level import/export (module) - otherwise ambient script */
  isModule: boolean
  symbols: DtsSymbol[]
}
/**
 * Parse a .d.ts source and extract the declared symbols that can be verified
 * by type-checking a probe:
 *
 * - interfaces / type aliases / classes / enums  -> type reference
 * - functions / variables                        -> typeof reference
 * - `declare module "x"`                         -> import its exports
 * - `declare global { var x }`                   -> typeof x
 * - `declare global { interface GlobalThis { x } }` -> typeof globalThis.x
 *
 * Non-exported declarations in module files are not reachable from outside
 * and are skipped.
 */
export declare const analyzeDts: (source: string, fileName: string) => DtsAnalysis
