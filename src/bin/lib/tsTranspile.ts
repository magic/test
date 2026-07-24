import ts from 'typescript'

/**
 * Transpile TypeScript source to ES modules.
 * Pure function with no I/O dependencies.
 */
export const transpileWithTypescript = (code: string): string => {
  const result = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
    reportDiagnostics: false,
  })
  return result.outputText
}
