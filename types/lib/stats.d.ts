export function isTestResult(obj: Suite | TestResult): obj is TestResult
export function toMinimalFixed(p: number, fix?: number): number
export function printPercent(p: number): string
export function test(t: PartialTest): void
export function info(pkg: string, suites: (Suite | undefined | void)[]): boolean
export function reset(): void
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
//# sourceMappingURL=stats.d.ts.map
