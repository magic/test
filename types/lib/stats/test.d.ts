export function test(t: PartialTest): void
export type TestStats = {
  /**
   * - Total number of tests
   */
  all: number
  /**
   * - Number of passing tests
   */
  pass: number
}
export type TestResults = Record<string, TestStats>
export type PartialTest = {
  name: string
  pkg?: string | undefined
  parent?: string | undefined
  pass: boolean
}
//# sourceMappingURL=test.d.ts.map
