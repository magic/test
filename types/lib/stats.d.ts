export function isTestResult(obj: Suite | TestResult): obj is TestResult
export function toMinimalFixed(p: number, fix?: number): number
export function printPercent(p: number): string
export function test(t: PartialTest, store: IStore): void
export function info(pkg: string, suites: (Suite | undefined | void)[], store: IStore): boolean
export function reset(store: IStore): void
export type StoreState = State
//# sourceMappingURL=stats.d.ts.map
