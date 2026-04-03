export function readRecursive(dir?: string): Promise<TestSuites>
export type ImportResult = {
  file?: string | undefined
  test?: unknown
  tests?: object | undefined
  error?: Error | undefined
  type?: 'error' | 'file' | 'directory' | 'skip' | undefined
}
export type TestAggregateError = Error & {
  name: string
  errors?: ImportResult[]
}
//# sourceMappingURL=readRecursive.d.ts.map
