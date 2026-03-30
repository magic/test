export function readRecursive(dir?: string): Promise<TestSuites>
export type ImportResult = {
  file?: string | undefined
  test?: unknown
  tests?: object | undefined
  error?: Error | undefined
  type: 'file' | 'directory' | 'error' | 'skip'
}
//# sourceMappingURL=readRecursive.d.ts.map
