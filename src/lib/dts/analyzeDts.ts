import ts from 'typescript'

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
  | { kind: 'importType'; name: string; from: 'file' | string }
  | { kind: 'importValue'; name: string; from: 'file' | string }
  | { kind: 'sideEffectImport'; from: string }
  | { kind: 'typeRef'; alias: string; target: string; value: boolean; via: 'plain' | 'globalThis' }

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
export const analyzeDts = (source: string, fileName: string): DtsAnalysis => {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, true)
  const isModule = ts.isExternalModule(sf)
  const symbols: DtsSymbol[] = []
  const seen = new Set<string>()

  const add = (symbol: DtsSymbol): void => {
    if (!seen.has(symbol.key)) {
      seen.add(symbol.key)
      symbols.push(symbol)
    }
  }

  const isExported = (node: ts.Node): boolean =>
    ((node as { modifiers?: readonly ts.ModifierLike[] }).modifiers ?? []).some(
      m => m.kind === ts.SyntaxKind.ExportKeyword,
    )

  /**
   * Collect one named declaration (interface/type/class/enum/function/variable).
   * `scope` is 'file' or the ambient module specifier it lives in.
   */
  const collectNamed = (node: ts.Node, scope: 'file' | string, label: string): void => {
    const nameNode = (node as { name?: ts.Node }).name
    if (!nameNode || nameNode.kind !== ts.SyntaxKind.Identifier) {
      return
    }
    const name = (nameNode as ts.Identifier).text

    // module files: only exported declarations are reachable from a probe
    if (scope === 'file' && isModule && !isExported(node)) {
      return
    }

    const isValue =
      ts.isFunctionDeclaration(node) ||
      ts.isVariableDeclaration(node) ||
      ts.isClassDeclaration(node)

    let lines: ProbeLine[]
    if (scope === 'file' && !isModule) {
      // ambient script file: names are global, the probe references them directly
      lines = [{ kind: 'typeRef', alias: `p_${name}`, target: name, value: isValue, via: 'plain' }]
    } else if (isValue) {
      lines = [
        { kind: 'importValue', name, from: scope },
        { kind: 'typeRef', alias: `p_${name}`, target: name, value: true, via: 'plain' },
      ]
    } else {
      lines = [
        { kind: 'importType', name, from: scope },
        { kind: 'typeRef', alias: `p_${name}`, target: name, value: false, via: 'plain' },
      ]
    }

    add({
      key: scope === 'file' ? `${label}:${name}` : `${label}:${scope}#${name}`,
      displayName: scope === 'file' ? `${label} ${name}` : `${label} ${scope}#${name}`,
      info:
        scope === 'file'
          ? `${label} ${name} is declared and usable`
          : `${name} is exported by ambient module "${scope}"`,
      lines,
    })
  }

  /** Collect the exports of an ambient module declaration. */
  const collectModuleBody = (mod: ts.ModuleDeclaration): void => {
    const nameNode = mod.name
    if (nameNode.kind !== ts.SyntaxKind.StringLiteral) {
      return
    }
    const moduleName = (nameNode as ts.StringLiteral).text
    const body = mod.body as ts.ModuleBlock | undefined

    if (!body || body.statements.length === 0) {
      // shorthand ambient module (`declare module "x";`) - just verify it resolves
      add({
        key: `module:${moduleName}`,
        displayName: `module ${moduleName}`,
        info: `ambient module "${moduleName}" is declared`,
        lines: [{ kind: 'sideEffectImport', from: moduleName }],
      })
      return
    }

    for (const stmt of body.statements) {
      if (!isExported(stmt)) {
        continue
      }
      if (
        ts.isInterfaceDeclaration(stmt) ||
        ts.isTypeAliasDeclaration(stmt) ||
        ts.isEnumDeclaration(stmt)
      ) {
        collectNamed(stmt, moduleName, 'type')
      } else if (ts.isClassDeclaration(stmt)) {
        collectNamed(stmt, moduleName, 'class')
      } else if (ts.isFunctionDeclaration(stmt)) {
        collectNamed(stmt, moduleName, 'function')
      } else if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          collectNamed(decl, moduleName, 'value')
        }
      }
    }
  }

  /** Collect globals from `declare global { ... }`. */
  const collectGlobal = (mod: ts.ModuleDeclaration): void => {
    const body = mod.body as ts.ModuleBlock | undefined
    if (!body) {
      return
    }
    for (const stmt of body.statements) {
      if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (decl.name.kind !== ts.SyntaxKind.Identifier) {
            continue
          }
          const name = (decl.name as ts.Identifier).text
          add({
            key: `global:${name}`,
            displayName: `global ${name}`,
            info: `global variable "${name}" is declared`,
            lines: [
              { kind: 'typeRef', alias: `p_${name}`, target: name, value: true, via: 'plain' },
            ],
          })
        }
      } else if (
        ts.isInterfaceDeclaration(stmt) &&
        (stmt.name as ts.Identifier).text === 'GlobalThis'
      ) {
        for (const member of stmt.members) {
          if (!ts.isPropertySignature(member) || member.name.kind !== ts.SyntaxKind.Identifier) {
            continue
          }
          const name = (member.name as ts.Identifier).text
          add({
            key: `global:${name}`,
            displayName: `globalThis.${name}`,
            info: `globalThis property "${name}" is declared`,
            lines: [
              {
                kind: 'typeRef',
                alias: `p_${name}`,
                target: name,
                value: false,
                via: 'globalThis',
              },
            ],
          })
        }
      }
    }
  }

  for (const stmt of sf.statements) {
    if (ts.isModuleDeclaration(stmt)) {
      const isGlobal =
        stmt.name.kind === ts.SyntaxKind.Identifier &&
        (stmt.name as ts.Identifier).text === 'global'
      if (isGlobal) {
        collectGlobal(stmt)
      } else {
        collectModuleBody(stmt)
      }
      continue
    }

    if (ts.isInterfaceDeclaration(stmt)) {
      collectNamed(stmt, 'file', 'interface')
    } else if (ts.isTypeAliasDeclaration(stmt)) {
      collectNamed(stmt, 'file', 'type')
    } else if (ts.isClassDeclaration(stmt)) {
      collectNamed(stmt, 'file', 'class')
    } else if (ts.isEnumDeclaration(stmt)) {
      collectNamed(stmt, 'file', 'enum')
    } else if (ts.isFunctionDeclaration(stmt)) {
      collectNamed(stmt, 'file', 'function')
    } else if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        collectNamed(decl, 'file', 'value')
      }
    }
  }

  return { isModule, symbols }
}
